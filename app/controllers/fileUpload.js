const fs = require("fs");
const { create, CID, urlSource } = require("ipfs-http-client");
const https = require("https");

const { INFURA_IPFS_PROJECT_ID, INFURA_IPFS_PROJECT_SECRET } = process.env;

const auth =
  "Basic " + btoa(INFURA_IPFS_PROJECT_ID + ":" + INFURA_IPFS_PROJECT_SECRET);

const ipfs_remote = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});
const ipfs_local = create({
  host: "localhost",
  port: 5001,
  protocol: "http",
  headers: {
    authorization: "Bearer " + auth,
  },
});

module.exports = {
  addMetadataToIPFS: async (body, network) => {
    // console.log(body)
    console.log("\n");
    const metaData = body;
    let cid;

    if (network == "ipfs_local") {
      console.log("ADDING METADATA TO LOCAL IPFS ========================] \n");
      const metaAdded = await ipfs_local.add(JSON.stringify(metaData));
      cid = await metaAdded.cid.toString();
      // console.log(cid)
      console.log("📁  " + "http://localhost:8080/ipfs/" + cid);
      return cid;
    } else if (network == "ipfs_remote") {
      console.log(
        "ADDING METADATA TO REMOTE IPFS ========================] \n"
      );
      const metaAdded = await ipfs_remote.add(JSON.stringify(metaData));
      cid = await metaAdded.cid.toString();
      console.log("📁  " + "https://cloudflare-ipfs.com/ipfs/" + cid);
      return cid;
    }
  },
};
