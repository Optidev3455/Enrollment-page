import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { getAllUsernames } from '$lib/credentials.server';

const enrollmentData = path.resolve('data/ENROLMENT.csv');

function getUserRole(username: string) {
  const firstLetter = username[0];
  if (firstLetter === 'S') {
    return 'Student';
  }
  if (firstLetter === 'T') {
    return 'Teacher';
  }
  if (firstLetter === 'A') {
    return 'Admin';
  }
  // default role
  // idk how someone will get to this point
  return 'Unknown';
}

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user?.username) {
    throw redirect(303, '/?loginRequired=1');
  }

  const username = locals.user.username;

  // kick students back to enrollemt page if they try to access this page
  if (getUserRole(username) === 'Student') {
    throw redirect(303, '/enrollment?permissionDenied=1');
  }

  const allUsers = getAllUsernames();

  // filter out students
  const students = allUsers.filter((usr) => usr.startsWith('S'));

  // learnt from https://stackoverflow.com/questions/51936369
  let enrollments: Record<string, string[]> = {}; // SID + EID

  if (fs.existsSync(enrollmentData)) {
    const contents = fs.readFileSync(enrollmentData, 'utf-8');
    // skip first line (SID, EID)
    const lines = contents.trim().split('\n').slice(1); 
    for (const line of lines) {
      const [sid, eidFull] = line.split(',');
      // skip users who are not students
      // teachers may want to participate in events but i will exclude them
      if (!sid.startsWith('S')) {
        continue;
      }

      // mark NULL as enrolled
      let eid = eidFull === 'NULL' ? 'NULL' : eidFull.slice(0, -1); // remove trailing group id

      // create enrollment array if it doesnt exist
      if (!enrollments[sid]) {
        enrollments[sid] = [];
      }
      enrollments[sid].push(eid);
    }
  }
  // map student usernames to their enrollments
  const studentEnrollments = students.map((sid) => {
    const eids = enrollments[sid] || [];

    const hasEnrolled = eids.length > 0; // boolean, true if have at least one eid else false

    const eventList = eids.filter((eid) => eid !== 'NULL');
    return {
      sid,
      enrolled: hasEnrolled, // boolean true or false
      // remove duplicate events using Set (new array of unique values)
      // code from https://stackoverflow.com/questions/9229645
      events: eventList.length > 0 ? Array.from(new Set(eventList)) : ['None'] // return 'None' if eventList.length > 0 is false (i.e. eid is NULL)
    };
  });

  return {
    username, // sid
    studentEnrollments // array: enrollemnt status and eids
  };
};
