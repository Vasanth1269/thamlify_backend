import Replicate from "replicate";

const replicate = new Replicate({
  auth:process.env.REPLICATNE_API_TOKE,

});
console.log("REPLICATE_API_TOKEN:", process.env.REPLICATNE_API_TOKE);


export default replicate;


