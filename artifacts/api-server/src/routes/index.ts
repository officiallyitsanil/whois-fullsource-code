import { Router, type IRouter } from "express";
import healthRouter from "./health";
import whoisRouter from "./whois";
import dnsRouter from "./dns";
import domainCheckRouter from "./domainCheck";
import historyRouter from "./history";

const router: IRouter = Router();

router.use(healthRouter);
router.use(whoisRouter);
router.use(dnsRouter);
router.use(domainCheckRouter);
router.use(historyRouter);

export default router;
