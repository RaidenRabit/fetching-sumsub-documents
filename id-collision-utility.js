/**
 * tool created for checking any potential collisions between sumsub records and external tool records
 *
 */
import { makeRequest } from './sumsub.js';

/**
 * holds a raw string containing the externalID used in sumsub and an email address
 * NOTE: this is made specifically for termius exports, if you need other extraction please make sure the conversion function works for your case
 */
  const externalData = `   1  exampleEmails1@sharklasers.com  
   2  exampleEmails2@sharklasers.com                 
   `;



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
  const orderedResults = results.sort((result) => result.ID);

  return orderedResults;
}

/**
 * decodes external info
 * NOTE: explicitely made for termius output. If your external output is different, please update this function to match you needs
 * @returns {*[]}
 */
const decodeExternalInfo = () => {
  const separatedStrings = externalData
    .trim()
    .replaceAll('\n', '')
    .split(new RegExp(`\\s+`, 'g'));
  const investors = [];
  for (let i = 0; i < separatedStrings.length; i=i+2) {
    investors.push({
      ID: separatedStrings[i],
      email: separatedStrings[i+1],
    })
  }
  return investors;
}

/**
 * holds a JSON string representing data ready for collision checks.
 * NOTE: Update this with the fetched data for convenience
 * @returns {any}
 */
const getArchivedDbInvestors = () => {
  const json = `[{"ID":"1","email":"digiSharesTest1@sharklasers.com"},{"ID":"2","email":"vm@digishares.io"},{"ID":"3","email":"phil@maptodl.io"},{"ID":"5","email":"Btim2199@gmail.com"},{"ID":"7","email":"info@coreestate.io"},{"ID":"8","email":"james_harold@me.com"},{"ID":"9","email":"unifiikatiedawn@gmail.com"},{"ID":"10","email":"waynebon@gmail.com"},{"ID":"14","email":"g.attewell@btopenworld.com"},{"ID":"15","email":"albutjames22@gmail.com"},{"ID":"16","email":"andy@arogers.co.uk"},{"ID":"18","email":"tobias.mooney@gmail.com"},{"ID":"19","email":"Natashaglasgow@hotmail.co.uk"},{"ID":"20","email":"adwynna@proton.me"},{"ID":"21","email":"olivergahegan@gmail.com"},{"ID":"22","email":"andrew_christophi@hotmail.com"},{"ID":"28","email":"namdhtm@gmail.com"},{"ID":"29","email":"sdponsford@sky.com"},{"ID":"35","email":"kristaps.cuders@gmail.com"},{"ID":"37","email":"fatihy1925@gmail.com"},{"ID":"38","email":"simon.glasgow@yahoo.co.uk"},{"ID":"39","email":"davidalancahill@gmail.com"},{"ID":"40","email":"Chriscolley1986@gmail.com"},{"ID":"41","email":"drfrank.umenze@gmail.com"},{"ID":"43","email":"paulmartin041290@gmail.com"},{"ID":"45","email":"jameshwilliamstribe@gmail.com"},{"ID":"46","email":"nk4seasons@icloud.com"},{"ID":"47","email":"ljs.unifii@gmail.com"},{"ID":"48","email":"nicholas.ashby@btinternet.com"},{"ID":"51","email":"simon.glasgow@yahoo.co.uk"},{"ID":"53","email":"lukehillman516@gmail.com"},{"ID":"54","email":"lincoln@jump-pad.co.uk"},{"ID":"55","email":"tony.miscandlon@gmail.com"},{"ID":"56","email":"rhyswalton25@protonmail.com"},{"ID":"59","email":"jen_caudwell@hotmail.co.uk"},{"ID":"60","email":"roboh79@gmail.com"},{"ID":"61","email":"leedowns1@gmail.com"},{"ID":"62","email":"drinki07@sky.com"},{"ID":"63","email":"greengraham13@gmail.com"},{"ID":"64","email":"craig@boefurniture.com"},{"ID":"65","email":"pets118@hotmail.com"},{"ID":"66","email":"isaiah.brown@hotmail.co.uk"},{"ID":"67","email":"Nigel.burwash@gmail.com"},{"ID":"68","email":"bruceingram@talk21.com"},{"ID":"69","email":"aaron.sandhu@rosevilleland.co.uk"},{"ID":"70","email":"samuel.t.aiello@gmail.com"},{"ID":"71","email":"overdalehouse@hotmail.com"},{"ID":"100","email":"eddiemanthorpe@gmail.com"},{"ID":"101","email":"wphillips22@outlook.com"},{"ID":"102","email":"justin.dover@me.com"},{"ID":"103","email":"digiTest2@sharklasers.com"},{"ID":"104","email":"kristaps.cuders@coreestate.io"},{"ID":"107","email":"nik_okeefe@hotmail.com"},{"ID":"110","email":"pmauerking@gmail.com"},{"ID":"111","email":"mark.duthie01@btinternet.com"},{"ID":"112","email":"mail@ianhuman.co.uk"},{"ID":"114","email":"alistairfroggett@gmail.com"},{"ID":"115","email":"Fagenceluke@gmail.com"},{"ID":"150","email":"Luke@roinetworkandsolutions.co.uk"}]`;
  return JSON.parse(json);
}

/**
 * holds a JSON string representing data ready for collision checks.
 * NOTE: Update this with the fetched data for convenience
 * @returns {any}
 */
const getArchivedSumSubInvestors = () => {
  const json = `[{"ID":1,"sumSubEmail":"digiSharesTest1@sharklasers.com","reviewResult":null},{"ID":2,"sumSubEmail":null,"reviewResult":null},{"ID":3,"sumSubEmail":"phil@maptodl.io","reviewResult":{"reviewAnswer":"RED","rejectLabels":["BAD_PROOF_OF_ADDRESS"],"reviewRejectType":"RETRY","buttonIds":["badPhoto","proofOfAddress_issueDate","badPhoto_imageEditor","proofOfAddress"]}},{"ID":4,"sumSubEmail":"kristaps.cuders@gmail.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":5,"sumSubEmail":null,"reviewResult":null},{"ID":6,"sumSubEmail":"kristaps.cuders@coreestate.io","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":7,"sumSubEmail":"info@coreestate.io","reviewResult":null},{"ID":8,"sumSubEmail":"james_harold@me.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":9,"sumSubEmail":"unifiikatiedawn@gmail.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":10,"sumSubEmail":"waynebon@gmail.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":11,"sumSubEmail":null,"reviewResult":null},{"ID":12,"sumSubEmail":null,"reviewResult":null},{"ID":13,"sumSubEmail":null,"reviewResult":null},{"ID":14,"sumSubEmail":"g.attewell@btopenworld.com","reviewResult":null},{"ID":15,"sumSubEmail":"albutjames22@gmail.com","reviewResult":null},{"ID":16,"sumSubEmail":"andy@arogers.co.uk","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":17,"sumSubEmail":null,"reviewResult":null},{"ID":18,"sumSubEmail":"tobias.mooney@gmail.com","reviewResult":null},{"ID":19,"sumSubEmail":"Natashaglasgow@hotmail.co.uk","reviewResult":null},{"ID":20,"sumSubEmail":null,"reviewResult":null},{"ID":21,"sumSubEmail":"olivergahegan@gmail.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":22,"sumSubEmail":"andrew_christophi@hotmail.com","reviewResult":null},{"ID":23,"sumSubEmail":"g.attewell@btopenworld.com","reviewResult":null},{"ID":24,"sumSubEmail":null,"reviewResult":null},{"ID":25,"sumSubEmail":null,"reviewResult":null},{"ID":26,"sumSubEmail":null,"reviewResult":null},{"ID":27,"sumSubEmail":null,"reviewResult":null},{"ID":28,"sumSubEmail":"namdhtm@gmail.com","reviewResult":null},{"ID":29,"sumSubEmail":"sdponsford@sky.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":30,"sumSubEmail":null,"reviewResult":null},{"ID":31,"sumSubEmail":null,"reviewResult":null},{"ID":32,"sumSubEmail":null,"reviewResult":null},{"ID":33,"sumSubEmail":null,"reviewResult":null},{"ID":34,"sumSubEmail":"veromarcore@gmail.com","reviewResult":{"moderationComment":"We could not verify your profile. Your region is not supported. If you have any questions, please contact the Company where you try to verify your profile","clientComment":"User's residency is not supported.","reviewAnswer":"RED","rejectLabels":["WRONG_USER_REGION","REGULATIONS_VIOLATIONS"],"reviewRejectType":"FINAL","buttonIds":["regulationsViolations_wrongResidency","regulationsViolations"]}},{"ID":35,"sumSubEmail":"kristaps.cuders@gmail.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":36,"sumSubEmail":"nicholas.ashby@btinternet.com","reviewResult":{"reviewAnswer":"RED","rejectLabels":["SCREENSHOTS","UNSATISFACTORY_PHOTOS"],"reviewRejectType":"RETRY","buttonIds":["badPhoto","badPhoto_screenshot"]}},{"ID":37,"sumSubEmail":"fatihy1925@gmail.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":38,"sumSubEmail":"simon.glasgow@yahoo.co.uk","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":39,"sumSubEmail":"davidalancahill@gmail.com","reviewResult":null},{"ID":40,"sumSubEmail":"Chriscolley1986@gmail.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":41,"sumSubEmail":"drfrank.umenze@gmail.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":42,"sumSubEmail":"Nathanhague99@gmail.com","reviewResult":{"reviewAnswer":"RED","rejectLabels":["BAD_PROOF_OF_ADDRESS"],"reviewRejectType":"RETRY","buttonIds":["proofOfAddress_issueDate","proofOfAddress"]}},{"ID":43,"sumSubEmail":"paulmartin041290@gmail.com","reviewResult":null},{"ID":44,"sumSubEmail":null,"reviewResult":null},{"ID":45,"sumSubEmail":"jameshwilliamstribe@gmail.com","reviewResult":null},{"ID":46,"sumSubEmail":"nk4seasons@icloud.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":47,"sumSubEmail":"ljs.unifii@gmail.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":48,"sumSubEmail":"nicholas.ashby@btinternet.com","reviewResult":null},{"ID":49,"sumSubEmail":null,"reviewResult":null},{"ID":50,"sumSubEmail":null,"reviewResult":null},{"ID":51,"sumSubEmail":null,"reviewResult":null},{"ID":52,"sumSubEmail":null,"reviewResult":null},{"ID":53,"sumSubEmail":"lukehillman516@gmail.com","reviewResult":null},{"ID":54,"sumSubEmail":"lincoln@jump-pad.co.uk","reviewResult":null},{"ID":55,"sumSubEmail":"tony.miscandlon@gmail.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":56,"sumSubEmail":"rhyswalton25@protonmail.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":57,"sumSubEmail":null,"reviewResult":null},{"ID":58,"sumSubEmail":"mail@ianhuman.co.uk","reviewResult":null},{"ID":59,"sumSubEmail":"jen_caudwell@hotmail.co.uk","reviewResult":null},{"ID":60,"sumSubEmail":"roboh79@gmail.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":61,"sumSubEmail":"leedowns1@gmail.com","reviewResult":null},{"ID":62,"sumSubEmail":"drinki07@sky.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":63,"sumSubEmail":"greengraham13@gmail.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":64,"sumSubEmail":"craig@boefurniture.com","reviewResult":null},{"ID":65,"sumSubEmail":"pets118@hotmail.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":66,"sumSubEmail":"isaiah.brown@hotmail.co.uk","reviewResult":null},{"ID":67,"sumSubEmail":"Nigel.burwash@gmail.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":68,"sumSubEmail":"bruceingram@talk21.com","reviewResult":{"moderationComment":"Provide your full address with a postcode. It should include a street, house number and flat number. Note that proof of address must match the address you filled previously.","clientComment":"The address on the profile does not match document data.","reviewAnswer":"RED","rejectLabels":["BAD_PROOF_OF_ADDRESS","PROBLEMATIC_APPLICANT_DATA","WRONG_ADDRESS"],"reviewRejectType":"RETRY","buttonIds":["proofOfAddress","dataMismatch","dataMismatch_address","proofOfAddress_dataMismatch"]}},{"ID":69,"sumSubEmail":"aaron.sandhu@rosevilleland.co.uk","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":70,"sumSubEmail":"samuel.t.aiello@gmail.com","reviewResult":{"moderationComment":"We could not verify your profile. Your region is not supported. If you have any questions, please contact the Company where you try to verify your profile","clientComment":"User's residency is not supported.","reviewAnswer":"RED","rejectLabels":["WRONG_USER_REGION","REGULATIONS_VIOLATIONS"],"reviewRejectType":"FINAL","buttonIds":["regulationsViolations_wrongResidency","regulationsViolations"]}},{"ID":71,"sumSubEmail":"overdalehouse@hotmail.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":72,"sumSubEmail":null,"reviewResult":null},{"ID":73,"sumSubEmail":null,"reviewResult":null},{"ID":74,"sumSubEmail":null,"reviewResult":null},{"ID":75,"sumSubEmail":null,"reviewResult":null},{"ID":76,"sumSubEmail":null,"reviewResult":null},{"ID":77,"sumSubEmail":null,"reviewResult":null},{"ID":78,"sumSubEmail":null,"reviewResult":null},{"ID":79,"sumSubEmail":null,"reviewResult":null},{"ID":80,"sumSubEmail":null,"reviewResult":null},{"ID":81,"sumSubEmail":null,"reviewResult":null},{"ID":82,"sumSubEmail":null,"reviewResult":null},{"ID":83,"sumSubEmail":null,"reviewResult":null},{"ID":84,"sumSubEmail":null,"reviewResult":null},{"ID":85,"sumSubEmail":null,"reviewResult":null},{"ID":86,"sumSubEmail":null,"reviewResult":null},{"ID":87,"sumSubEmail":null,"reviewResult":null},{"ID":88,"sumSubEmail":null,"reviewResult":null},{"ID":89,"sumSubEmail":null,"reviewResult":null},{"ID":90,"sumSubEmail":null,"reviewResult":null},{"ID":91,"sumSubEmail":null,"reviewResult":null},{"ID":92,"sumSubEmail":null,"reviewResult":null},{"ID":93,"sumSubEmail":null,"reviewResult":null},{"ID":94,"sumSubEmail":null,"reviewResult":null},{"ID":95,"sumSubEmail":null,"reviewResult":null},{"ID":96,"sumSubEmail":null,"reviewResult":null},{"ID":97,"sumSubEmail":null,"reviewResult":null},{"ID":98,"sumSubEmail":null,"reviewResult":null},{"ID":99,"sumSubEmail":null,"reviewResult":null},{"ID":100,"sumSubEmail":null,"reviewResult":null},{"ID":101,"sumSubEmail":"wphillips22@outlook.com","reviewResult":null},{"ID":102,"sumSubEmail":"justin.dover@me.com","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":103,"sumSubEmail":"digiTest2@sharklasers.com","reviewResult":null},{"ID":104,"sumSubEmail":"kristaps.cuders@coreestate.io","reviewResult":{"reviewAnswer":"GREEN"}},{"ID":105,"sumSubEmail":null,"reviewResult":null},{"ID":106,"sumSubEmail":null,"reviewResult":null},{"ID":107,"sumSubEmail":"nik_okeefe@hotmail.com","reviewResult":null},{"ID":108,"sumSubEmail":"pmauerking@gmail.com","reviewResult":null},{"ID":109,"sumSubEmail":null,"reviewResult":null},{"ID":110,"sumSubEmail":"pmauerking@gmail.com","reviewResult":null},{"ID":111,"sumSubEmail":null,"reviewResult":null},{"ID":112,"sumSubEmail":"mail@ianhuman.co.uk","reviewResult":null},{"ID":113,"sumSubEmail":null,"reviewResult":null},{"ID":114,"sumSubEmail":"alistairfroggett@gmail.com","reviewResult":null},{"ID":115,"sumSubEmail":"Fagenceluke@gmail.com","reviewResult":null},{"ID":116,"sumSubEmail":null,"reviewResult":null},{"ID":117,"sumSubEmail":null,"reviewResult":null},{"ID":118,"sumSubEmail":null,"reviewResult":null},{"ID":119,"sumSubEmail":null,"reviewResult":null},{"ID":120,"sumSubEmail":null,"reviewResult":null},{"ID":121,"sumSubEmail":null,"reviewResult":null},{"ID":122,"sumSubEmail":null,"reviewResult":null},{"ID":123,"sumSubEmail":null,"reviewResult":null},{"ID":124,"sumSubEmail":null,"reviewResult":null},{"ID":125,"sumSubEmail":null,"reviewResult":null},{"ID":126,"sumSubEmail":null,"reviewResult":null},{"ID":127,"sumSubEmail":null,"reviewResult":null},{"ID":128,"sumSubEmail":null,"reviewResult":null},{"ID":129,"sumSubEmail":null,"reviewResult":null},{"ID":130,"sumSubEmail":null,"reviewResult":null},{"ID":131,"sumSubEmail":null,"reviewResult":null},{"ID":132,"sumSubEmail":null,"reviewResult":null},{"ID":133,"sumSubEmail":null,"reviewResult":null},{"ID":134,"sumSubEmail":null,"reviewResult":null},{"ID":135,"sumSubEmail":null,"reviewResult":null},{"ID":136,"sumSubEmail":null,"reviewResult":null},{"ID":137,"sumSubEmail":null,"reviewResult":null},{"ID":138,"sumSubEmail":null,"reviewResult":null},{"ID":139,"sumSubEmail":null,"reviewResult":null},{"ID":140,"sumSubEmail":null,"reviewResult":null},{"ID":141,"sumSubEmail":null,"reviewResult":null},{"ID":142,"sumSubEmail":null,"reviewResult":null},{"ID":143,"sumSubEmail":null,"reviewResult":null},{"ID":144,"sumSubEmail":null,"reviewResult":null},{"ID":145,"sumSubEmail":null,"reviewResult":null},{"ID":146,"sumSubEmail":null,"reviewResult":null},{"ID":147,"sumSubEmail":null,"reviewResult":null},{"ID":148,"sumSubEmail":null,"reviewResult":null},{"ID":149,"sumSubEmail":null,"reviewResult":null},{"ID":150,"sumSubEmail":"Luke@roinetworkandsolutions.co.uk","reviewResult":null}]`;
  return JSON.parse(json);
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
  const dbInvestors = getArchivedDbInvestors();
  const sumsubInvestors = await getArchivedSumSubInvestors();

  const missingDbInvestor = [];
  const badEmailMatch = [];
  const allGood = [];

  sumsubInvestors.forEach((sumsubInvestor) => {
    const dbInvestor = dbInvestors.find((dbInvestor) => dbInvestor.ID === sumsubInvestor.ID);
    if (!dbInvestor) {
      missingDbInvestor.push(sumsubInvestor);
    } else if (dbInvestor.email !== sumsubInvestor.email && sumsubInvestor.email) {
      badEmailMatch.push({
        ...sumsubInvestor,
        dbEmail: dbInvestor.email
      });
    } else {
      allGood.push({
        ...sumsubInvestor,
        dbEmail: dbInvestor.email
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
