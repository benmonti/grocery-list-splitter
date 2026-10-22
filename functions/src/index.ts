import {setGlobalOptions} from "firebase-functions";
import * as admin from "firebase-admin";
import {HttpsError, onCall, onRequest} from "firebase-functions/v2/https";

admin.initializeApp();

interface RegisterEmailData {
  email: string;
}

export const registerEmail = onCall<RegisterEmailData>(
  async (request) => {
    const email = request.data.email;
    const uid = request.auth?.uid;

    if (!email || !uid) {
      throw new HttpsError("invalid-argument", "Email required");
    }

    const sanitizedEmail = email.toLowerCase().replace(/\./g, ",");
    await admin.database().ref(`userEmails/${sanitizedEmail}`).set(uid);

    const displayName = request.auth?.token?.name || "";
    await admin.database().ref(`users/${uid}/profile`).set({
      name: displayName,
      email,
    });

    return {success: true};
  },
);

export const shareList = onCall<
  {listId: string; invitedUids?: string[]; invitedUid?: string},
  Promise<{success: boolean}>
>(async (request) => {
  const {listId} = request.data;
  const invitedUids = request.data.invitedUids ||
    (request.data.invitedUid ? [request.data.invitedUid] : []);
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError("unauthenticated", "Must be logged in to share");
  }
  if (!listId || invitedUids.length === 0) {
    throw new HttpsError("invalid-argument", "Missing parameters");
  }

  try {
    const database = admin.database();
    const listSnapshot = await database.ref(`lists/${listId}`).once("value");
    const list = listSnapshot.val();
    if (!list || !list.editors?.[uid]) {
      throw new HttpsError("permission-denied", "You cannot share this list");
    }

    const updates: Record<string, string | boolean> = {};
    for (const invitedUid of [...new Set(invitedUids)]) {
      const profileSnapshot = await database
        .ref(`users/${invitedUid}/profile`)
        .once("value");
      const userName = profileSnapshot.val()?.name || "";

      updates[`lists/${listId}/editors/${invitedUid}/name`] = userName;
      updates[`users/${invitedUid}/lists/${listId}`] = true;
    }

    await database.ref().update(updates);
    return {success: true};
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to share list");
  }
});

export const searchUsers = onCall<{query: string}>(async (request) => {
  const query = request.data.query?.trim().toLowerCase();
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Must be logged in to search");
  }
  if (!query || query.length < 2) {
    return {users: []};
  }

  const usersSnapshot = await admin.database().ref("users").once("value");
  const users = usersSnapshot.val() || {};
  const matches = Object.entries(users)
    .map(([uid, value]) => {
      const profile = (value as {
        profile?: {name?: string; email?: string};
      }).profile || {};
      return {
        uid,
        name: profile.name || "",
        email: profile.email || "",
      };
    })
    .filter((profile) =>
      `${profile.name} ${profile.email}`.toLowerCase().includes(query),
    )
    .slice(0, 8);

  return {users: matches};
});

export const removeListMember = onCall<{
  listId: string;
  memberUid: string;
}>(async (request) => {
  const {listId, memberUid} = request.data;
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError("unauthenticated", "Must be logged in");
  }
  if (!listId || !memberUid) {
    throw new HttpsError("invalid-argument", "Missing parameters");
  }
  if (uid === memberUid) {
    throw new HttpsError("invalid-argument", "You cannot remove yourself");
  }

  const database = admin.database();
  const listRef = database.ref(`lists/${listId}`);
  const listSnapshot = await listRef.once("value");
  const list = listSnapshot.val();

  if (!list) return {success: true};
  if (!list.editors?.[uid]) {
    throw new HttpsError("permission-denied", "You cannot edit this list");
  }
  if (!list.editors?.[memberUid]) {
    return {success: true};
  }

  const editorUids = Object.keys(list.editors);
  const memberIndex = editorUids.indexOf(memberUid);
  const groceryList = Array.isArray(list.groceryList) ? list.groceryList : [];
  const updatedGroceryList = groceryList.map((item: {
    people?: boolean[];
  }) => ({
    ...item,
    people: Array.isArray(item.people) ?
      item.people.filter((_: boolean, index: number) => index !== memberIndex) :
      item.people,
  }));
  const updatedPeople = Array.isArray(list.people) ?
    list.people.filter((_: unknown, index: number) => index !== memberIndex) :
    list.people;

  await database.ref().update({
    [`lists/${listId}/editors/${memberUid}`]: null,
    [`lists/${listId}/groceryList`]: updatedGroceryList,
    [`lists/${listId}/people`]: updatedPeople,
    [`users/${memberUid}/lists/${listId}`]: null,
  });

  return {success: true};
});

export const deleteList = onCall<{listId: string}>(async (request) => {
  const {listId} = request.data;
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError(
      "unauthenticated",
      "Must be logged in to delete a list",
    );
  }
  if (!listId) {
    throw new HttpsError("invalid-argument", "Missing list ID");
  }

  const database = admin.database();
  const listSnapshot = await database.ref(`lists/${listId}`).once("value");
  const list = listSnapshot.val();

  if (!list) return {success: true};

  const editors = list.editors || {};
  if (!editors[uid]) {
    throw new HttpsError("permission-denied", "You cannot delete this list");
  }

  const updates: Record<string, null> = {
    [`lists/${listId}`]: null,
  };
  Object.keys(editors).forEach((editorUid) => {
    updates[`users/${editorUid}/lists/${listId}`] = null;
  });

  await database.ref().update(updates);
  return {success: true};
});

export const getUserProfile = onRequest(
  {cors: true},
  async (req, res) => {
    try {
      const authHeader = req.headers.authorization || "";
      const match = authHeader.match(/^Bearer (.*)$/);
      if (!match) {
        res.status(401).json({error: "Unauthorized - no token"});
        return;
      }

      const decodedToken = await admin.auth().verifyIdToken(match[1]);
      const listEditorSnap = await admin.database()
        .ref(`lists/${req.query.listId}/editors/${decodedToken.uid}`)
        .once("value");

      if (!listEditorSnap.exists()) {
        res.status(403).json({error: "Forbidden"});
        return;
      }

      const uid = req.query.uid as string;
      if (!uid) {
        res.status(400).json({error: "Missing uid"});
        return;
      }

      const userRecord = await admin.database()
        .ref(`users/${uid}/profile`)
        .once("value");
      res.status(200).json(userRecord.val());
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
);

setGlobalOptions({maxInstances: 10});
