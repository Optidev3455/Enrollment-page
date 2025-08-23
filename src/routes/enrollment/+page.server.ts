import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export const load: PageServerLoad = async ({ locals }) => {
  // prevent access if user is not logged in
  if (!locals.user?.username) {
    throw redirect(303, '/?loginRequired=1');
  }
  return { 
    username: locals.user.username 
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {

    // userdata for csv file writing
    const formData = await request.formData();
    const username = locals.user?.username;
    const dob = formData.get('dob');
    const selectedEIDs = formData.getAll('eid');


    // probably not required as both fields are required but just in case
    if (!dob || typeof dob !== 'string') {
      // cant use return new response typescript error
      // Error: Data returned from action inside /enrollment is not serializable. 
      // Form actions need to return plain objects or fail(). E.g. return { success: true } or return fail(400, { message: "invalid" });
      return fail(400, { error: 'Birth year is required' });
    }

    if (!selectedEIDs.length) {
      return fail(400, { error: 'At least one event selection is required' });
    }

    // turn dob (string) to number (10 means decimal base)
    const year = parseInt(dob, 10);

    // final letter in EID
    let identifier = '';
    if (year >= 2007 && year <= 2009) {
      identifier = 'A';
    }
    else if (year >= 2010 && year <= 2012) {
      identifier = 'B';
    }
    else if (year >= 2013 && year <= 2014) {
      identifier = 'G';
    }
    // probably wont happen
    else return fail(400, { error: 'Invalid birth year' });

    // mark the dir for saving csv file
    const dataDir = path.resolve(process.cwd(), 'data'); // https://stackoverflow.com/questions/31414852/process-env-pwd-vs-process-cwd/

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
      //console.log('created data directory'); // debugging purpose
    }

    const filePath = path.join(dataDir, 'ENROLMENT.csv');
    //console.log('writing to:', filePath); // debugging purpose

    if (!fs.existsSync(filePath)) {
      // make first line (A1 and B1 in excel) to be SID and EID
      fs.writeFileSync(filePath, 'SID,EID\n', { encoding: 'utf-8' });
      //console.log('csv file created'); // debugging purpose
    }

    let csvLines = '';
    // use "of" beacause selectedEIDs is an array 
    // reference: https://www.geeksforgeeks.org/javascript/explain-the-differences-between-for-in-and-for-of-statement-in-javascript/
    for (const eid of selectedEIDs) {
      // though it is a string, it is a good practice to do, learnt online
      if (typeof eid !== 'string') {
          continue;
      }
      if (eid === 'NULL') {
        csvLines += `${username},NULL\n`;
      } else {
        csvLines += `${username},${eid}${identifier}\n`;
      }
    }

    try {
      fs.appendFileSync(filePath, csvLines, { encoding: 'utf-8' });
      //console.log('CSV data appended:', csvLines); // debugging purpose
    } catch (error) {
      // only happens if file cannot be written (either permission issue or is read-only)
      console.error('Failed to save enrollment data:', error);
      return fail(500, { error: 'Failed to save enrollment data' });
    }

    return { 
      success: true 
    };
  }
};
