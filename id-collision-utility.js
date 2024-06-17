/**
 * tool created for checking any potential collisions between sumsub records and external tool records
 *
 */
import { makeRequest } from './sumsub.js';

/**
 * holds a raw string containing the externalID used in sumsub and an email address
 * NOTE: this is made specifically for termius exports, if you need other extraction please make sure the conversion function works for your case
 */
  const externalData = `1 digiSharesTest1@sharklasers.com`;
  let archivedDbData = ``;
  let archivedSumSubData = ``;



/**
 * since we're storing investors with a dedicated external ID, we need to first find what's the sumsub applicant ID
 * this function returns the applicantID as well as the inspectionID
 * @param externalID
 * @returns {Promise<{inspectionID: *, applicantID}>}
 */
const getInvestorData = async (externalID) => {
  try {
    const url = `/resources/applicants/-;externalUserId=${externalID}`;
    const result = await makeRequest("GET", url);
    return {
      email: result.list.items[0].email,
      reviewResult: result.list.items[0].review.reviewResult,
    };
  } catch (e) {
    // console.error(e);
  }
};

/**
 * fetch sumsub info based on the set range of IDs
 */
const getSumSubInfo = async () => {
  let externalIDs = [];
  for (let i = 1; i<=150; i++) {
    externalIDs.push(i);
  }
  console.log(`_________________________________${externalIDs}__________________________________________________`);

  const results = await Promise.all(externalIDs.map(async (externalID) => {
    const response = await getInvestorData(externalID);
    return {
      ID: externalID,
      sumSubEmail: response?.email ?? null,
      reviewResult: response?.reviewResult ?? null,
    }
  }));
  return results.sort((result) => result.ID);
}

/**
 * decodes external info
 * NOTE: explicitely made for termius output. If your external output is different, please update this function to match you needs
 * @returns {*[]}
 */
const decodeExternalInfo = () => {
  const separatedStrings = externalData
    .trim()
    .replaceAll('\n', ' ')
    .split(new RegExp(`\\s+`, 'g'));
  const investors = [];
  for (let i = 0; i < separatedStrings.length; i=i+2) {
    investors.push({
      ID: +separatedStrings[i],
      dbEmail: separatedStrings[i+1],
    })
  }
  return investors;
}

const logFinding = (title, records) => {
  console.log(`_______________________________________________${title} - total: ${records.length}_________________________________________________________________`);
  console.log(records);
}

/**
 * fetches data in bulk from sumsub and decodes the external info to a comparable output for the collision check
 * NOTE: you can save the console output in the archive functions in order to not spam sumsub during development/investigation
 * @returns {Promise<void>}
 */
const bulkFetchData = async () => {
  const dbInvestors = decodeExternalInfo();
  const sumsubInvestors = await getSumSubInfo();
  archivedSumSubData = sumsubInvestors;
  archivedDbData = dbInvestors;
  console.log(JSON.stringify(sumsubInvestors));
  console.log("______________________");
  console.log(JSON.stringify(dbInvestors));
}

/**
 * detects collisions between the sumsub records and db results based on externalID and email matches. Will not check any other data
 *
 * will output the info in a nicely formatted console log
 * NOTE: BAD EMAIL MATCH are the colliding records
 * @returns {Promise<void>}
 */
const detectCollisions = async () => {
  const dbInvestors = JSON.parse(archivedDbData);
  const sumsubInvestors = JSON.parse(archivedSumSubData);

  const missingDbInvestor = [];
  const badEmailMatch = [];
  const allGood = [];

  sumsubInvestors.forEach((sumsubInvestor) => {
    const dbInvestor = dbInvestors.find((dbInvestor) => dbInvestor.ID === sumsubInvestor.ID);
    if (!dbInvestor) {
      missingDbInvestor.push(sumsubInvestor);
    } else if (dbInvestor.dbEmail !== sumsubInvestor.sumSubEmail && sumsubInvestor.sumSubEmail) {
      badEmailMatch.push({
        ...sumsubInvestor,
        dbEmail: dbInvestor.dbEmail
      });
    } else {
      allGood.push({
        ...sumsubInvestor,
        dbEmail: dbInvestor.dbEmail
      });
    }
  });

  logFinding('MISSING DB INVESTORS', missingDbInvestor);
  logFinding('BAD EMAIL MATCH', badEmailMatch);
  logFinding('ALL GOOD', allGood);
}

export const startCollisionCheck = async () => {
  await bulkFetchData();
  await detectCollisions();
}
