import { useState } from "react";

// Keyword definitions
const categoryKeywords = {
  Food: ["zomato", "swiggy", "dominos", "pizza", "mcdonald", "kfc", "restaurant", "dineout", "eating", "lunch", "dinner", "breakfast", "eatery", "cafeteria", "cafe", "biryani", "foodpanda", "bbq", "thali", "food", "drinks", "snacks"],
  Transportation: ["uber", "ola", "rapido", "redbus", "irctc", "train", "metro", "bus", "cab", "taxi", "prepaid taxi", "auto", "autorickshaw", "quickride", "shuttl", "goibibo", "makemytrip", "indigo", "airasia", "vistara", "spicejet", "goair", "flight", "air india", "toll", "petrol", "fuel", "Transportation"],
  Entertainment: ["bookmyshow", "pvr", "inox", "cinema", "movies", "netflix", "amazon prime", "hotstar", "disney+", "zee5", "sony liv", "alt balaji", "youtube premium", "spotify", "apple music", "gaming", "theatre", "entertainment", "tickets", "fun city", "arcade"],
  Shopping: ["amazon", "flipkart", "myntra", "ajio", "tatacliq", "meesho", "nykaa", "bigbasket", "grofers", "jiomart", "shopclues", "zivame", "pepperfry", "firstcry", "lenskart", "purplle", "bewakoof", "decathlon", "shopping", "store", "mall", "sale", "purchase", "instamart", "zepto", "blanket", "quickcommerce", "online shopping", "clothes"],
  Utility: ["electricity", "water bill", "bescom", "bmc", "mseb", "bills", "billdesk", "postpaid", "prepaid", "gas", "bharat gas", "indane", "hp gas", "broadband", "internet", "wifi", "airtel", "jio", "vi", "vodafone", "bsnl", "tatasky", "dth", "cable", "mobile recharge", "phonepe recharge", "gpay recharge", "recharge", "Utility"],
  HealthCare: ["pharmacy", "pharmeasy", "1mg", "netmeds", "medlife", "apollo", "health", "clinic", "hospital", "doctor", "medplus", "diagnostics", "pathology", "lab", "consultation", "medicines", "ayurveda", "homeopathy", "medicine", "insurance", "premium", "term insurance", "lab", "diagnosis", "HealthCare"],
  Others: []
};

// Utility function
export const categorizeMonthTransactions = (pdfData = [], month, year) => {
  const result = {};
for (const category in categoryKeywords) {
    result[category] = {
        transactions: [],
        totalAmount: 0
    };
}
  result["Others"] = {
      transactions: [],
      totalAmount: 0
    };
    
    // Step 2: Normalize month
    const monthIndex = typeof month === "string"
    ? new Date(`${month} 1, 2023`).getMonth()
    : typeof month === "number"
    ? month
    : null;
    
    if (monthIndex === null || isNaN(monthIndex) || !year) {
        throw new Error("Invalid or missing month/year input.");
    }
    
    // Step 3: Parse DD-MM-YYYY
    const getMonthAndYear = (dateStr) => {
        if (!dateStr) return { month: null, year: null };
        const [dd, mm, yyyy] = dateStr.split("-").map(Number);
        return {
            month: mm - 1, // 0-based month
            year: yyyy
        };
    };
    
    // Step 4: Categorize
    pdfData.forEach((txn) => {
        const { month: txnMonth, year: txnYear } = getMonthAndYear(txn.date);
        if (txnMonth !== monthIndex || txnYear !== Number(year)) return;

    const narration = txn.narration?.toLowerCase() || "";
    const keyword = narration.split('/').pop();

    let matched = false;

    for (const category in categoryKeywords) {
      if (categoryKeywords[category].some(k => keyword.includes(k.toLowerCase()))) {
        result[category].transactions.push(txn);
        result[category].totalAmount += parseFloat(txn.amount || 0);
        matched = true;
        break;
      }
    }

    if (!matched) {
      result["Others"].transactions.push(txn);
      result["Others"].totalAmount += parseFloat(txn.amount || 0);
    }
  });

  return result;
};

