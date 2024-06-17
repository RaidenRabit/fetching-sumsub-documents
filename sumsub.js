import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';

// add your secrets here
const ApiSecretKey = '';
const AppToken = '';
const commonFilePath = './downloadedDocuments/';

/**
 * used to get the authentication headers for subsequent sumsub calls
 * @param method
 * @param url
 * @returns {Promise<{signature: string, token: string, timestamp: number}>}
 */
const getTokens = async (method, url) => {

  const timestamp = Math.round(Date.now() / 1000);
  const signature = crypto
    .createHmac('sha256', ApiSecretKey)
    .update(`${timestamp}${method}${url}`)
    .digest('hex');
  return {
    token: AppToken,
    signature,
    timestamp,
  };
};

/**
 * uses axios to request stuff from sumsub
 * @param method
 * @param url
 * @returns {Promise<any>}
 */
const makeRequest = async (method, url) => {
  const config = await getTokens(method, url);
  try {
    const response = await axios.request({
      method,
      url: `https://api.sumsub.com${url}`,
      data: null,
      headers: {
        'X-App-Token': `${config.token}`,
        'X-App-Access-Sig': `${config.signature}`,
        'X-App-Access-Ts': `${config.timestamp}`,
      },
    });

    if (response.status !== 200) {
      throw new Error(response.statusText);
    }
    return response.data;
  } catch (e) {
    console.log('e: ', e);
  }
};

/**
 * this is the function that actually downloads the documents for the user.
 * @param method
 * @param url
 * @param fileName
 * @returns {Promise<unknown>}
 */
const downloadDocumentAxios = async (method, url, fileName) => {
  const config = await getTokens(method, url);
  try {
    const response = await axios({
      method,
      url: `https://api.sumsub.com${url}`,
      data: null,
      headers: {
        'X-App-Token': `${config.token}`,
        'X-App-Access-Sig': `${config.signature}`,
        'X-App-Access-Ts': `${config.timestamp}`,
      },
      responseType: 'stream',
    });
    fs.mkdir(commonFilePath, { recursive: true }, (err) => {
      if (err) throw err;
    });
    return new Promise((resolve, reject) => {
      response.data
        .pipe(fs.createWriteStream(fileName))
        .on('error', reject)
        .once('close', () => resolve(fileName))
    })
  } catch (e) {
    console.log('e: ', e);
  }
}

/**
 * since we're storing investors with a dedicated external ID, we need to first find what's the sumsub applicant ID
 * this function returns the applicantID as well as the inspectionID
 * @param externalID
 * @returns {Promise<{inspectionID: *, applicantID}>}
 */
const getInvestorData = async (externalID) => {
  const url = `/resources/applicants/-;externalUserId=${externalID}/one`;
  const response = await makeRequest("GET", url);
  return { applicantID: response.id, inspectionID: response.inspectionId };
};

/**
 * finds all the documentIDs linked to the applicant
 * @param insepectionID
 * @returns {Promise<FlatArray<*[], 1>[]>}
 */
const getDocIDs = async (insepectionID) => {
  const url = `/resources/applicants/${insepectionID}/requiredIdDocsStatus`;
  const response = await makeRequest("GET", url);
  let imageIds = [];
  for (const property in response) {
    const imageID = response[property]?.imageIds;
    if (imageID.length) {
      imageIds.push(imageID);
    }
  }
  return imageIds.flat();
}

/**
 * initializes the download process for the specified document
 * @param insepectionID
 * @param documentID
 * @param fileName
 * @returns {Promise<*>}
 */
const getDocImage = async (insepectionID, documentID, fileName) => {
  const url = `/resources/inspections/${insepectionID}/resources/${documentID}`;
  return downloadDocumentAxios("GET", url, fileName);
}

const start = async () => {
  const { applicantID, inspectionID } = await getInvestorData(559);
  console.log("inspectionID: ", inspectionID);

  const docIDs = await getDocIDs(applicantID);
  console.log("docIDs: ", docIDs);

  await Promise.all(
    docIDs.map(async (docID) => {
      await getDocImage(inspectionID, docID, `${commonFilePath}document-${docID}.png`);
      console.log("Downloaded: ", docID);
  }))
}

export { start, makeRequest };
