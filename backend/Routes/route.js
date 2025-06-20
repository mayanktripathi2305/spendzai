const express = require("express");
const { parseBankStatement } = require("../Controller/PdfParsing.controller");
const { parseBankStatement2 } = require("../Controller/pdf2json.controller");
const { parseBankStatement3 } = require("../Controller/pdf_parse.controller");
const { parseICICIBankStatementComercial } = require("../Controller/Comercial/ICICIBank.controller");
const { parseKotakBankStatementSavings } = require("../Controller/Savings/KotakBank.controller");
const { extractBankData } = require("../Controller/Savings/KotakBankWithHeader.controller");
const { parseICICIBankStatement } = require("../Controller/Comercial/iciciBankHeader.controller");
const router = express.Router();


// router.post("/parse-pdf",parseBankStatement)
// router.post("/parse-pdf",parseBankStatement2)
// router.post("/parse-pdf",parseBankStatement3)
router.post("/parse-pdf-icici-commercial",parseICICIBankStatementComercial)
// router.post("/parse-pdf",parseICICIBankStatement) // icici comercial bank

// router.post("/parse-pdf",parseKotakBankStatementSavings)
router.post("/parse-pdf",extractBankData)  // Kotak saving bank



module.exports = router