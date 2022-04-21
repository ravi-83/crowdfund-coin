import web3 from "./web3";
import CampaignFactroy from "./build/CampaginFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactroy.interface),
  "0x99e563565148117110524A607403906592802098"
);

export default instance;
