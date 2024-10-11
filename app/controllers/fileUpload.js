const fs = require("fs");
const { create, CID, urlSource } = require("ipfs-http-client");
const https = require("https");

const { INFURA_IPFS_PROJECT_ID, INFURA_IPFS_PROJECT_SECRET } = process.env;

const auth = "Basic " + Buffer.from(
  INFURA_IPFS_PROJECT_ID+":"+INFURA_IPFS_PROJECT_SECRET
).toString("base64");

const ipfs_remote = create({
  host: "ipfs.infura.io",
  port: 5001,
  path: "/api/v0/add",
  protocol: "https",
  headers: {
    authorization: auth,
  },
});
const ipfs_local = create({
  host: "localhost",
  port: 5001,
  path: "/api/v0/add",
  protocol: "http",
  headers: {
    authorization: auth,
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
      let metaAdded;

      ipfs_local.add(JSON.stringify(metaData))
        .then((res) => {
          console.log("res", res);
          metaAdded = res;
        })
        .catch((err) => {
          console.log("err", err);
        });

      console.log("metaAdded", metaAdded);
      cid = await metaAdded.cid.toString();
      // console.log(cid)
      console.log("📁  " + "http://localhost:8080/ipfs/" + cid);
      return cid;
    } else if (network == "ipfs_remote") {
      console.log(
        "ADDING METADATA TO REMOTE IPFS ========================] \n"
      );
      let metaAdded;
      
      ipfs_remote.add(JSON.stringify(metaData))
        .then((res) => {
          console.log("res", res);
          metaAdded = res;
        })
        .catch((err) => {
          console.log("err", err);
        });

      console.log("metaAdded", metaAdded);
      cid = await metaAdded.cid.toString();
      console.log("📁  " + "https://cloudflare-ipfs.com/ipfs/" + cid);
      return cid;
    }
  },
};
