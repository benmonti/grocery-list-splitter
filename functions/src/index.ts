/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
// import { onRequest } from "firebase-functions/https";
// import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {onCall, HttpsError, onRequest} from "firebase-functions/v2/https";

admin.initializeApp();

interface RegisterEmailData {
    email: string;
}

export const registerEmail = onCall<
    RegisterEmailData,
    Promise<{success: boolean}>
>(async (request) => {
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
    email: email,
  });

  return {success: true};
});

export const shareList = onCall<
  { listId: string; invitedUid: string },
  Promise<{success: boolean}>
>(async (request) => {
  const {listId, invitedUid} = request.data;
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Must be logged in to share");
  }
  if (!listId || !invitedUid) {
    throw new HttpsError("invalid-argument", "Missing parameters");
  }

  try {
    // Add invitedUid to editors
    await admin
      .database()
      .ref(`lists/${listId}/editors/${invitedUid}`)
      .set(true);

    // Add list to the invited user’s list collection
    await admin
      .database()
      .ref(`users/${invitedUid}/lists/${listId}`)
      .set(true);

    return {success: true};
  } catch (err) {
    throw new HttpsError("internal", "Failed to share list");
  }
});


export const getUserProfile = onRequest(
  {cors: true},
  async (req, res) => {
    try {
      const authHeader = req.headers.authorization || "";
      // Must be in the form "Bearer <token>"
      const match = authHeader.match(/^Bearer (.*)$/);
      if (!match) {
        res.status(401).json({error: "Unauthorized - no token"});
        return;
      }

      const idToken = match[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // enforce that users can only fetch profiles if they are editors
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
    } catch (err) {
      res.status(500).json({erros: (err as Error)?.message || String(err)});
    }
  }
);
// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
