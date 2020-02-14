const PdfPrinter = require("pdfmake")
const path = require("path")
const fs = require("fs-extra")
const pdfTemplate = require("./pdfTemplate")




const generatePDF = (profileToPDF) =>{
    new Promise ((resolve,reject)=>{
try {
    var fonts ={
        Roboto: {
            normal:"Helvetica",
            bold: "Helvetica-Bold",
            italics: "Helvetica-Oblique",
            bolditalics: "Helvetica-BoldOblique"
        }
    }
// let fileExtension = profileToPDF.imageUrl.substring(profileToPDF.imageUrl.lastIndexOf("."));
// console.log('file extension', fileExtension)
const printer = new PdfPrinter(fonts)
const pdfContent = pdfTemplate(profileToPDF)
const pdfDoc = printer.createPdfKitDocument(pdfContent, {});

pdfDoc.pipe(fs.createWriteStream(path.join(__dirname, `${profileToPDF.username}.pdf`)))
pdfDoc.end();
resolve()
    
} catch (error) {
   console.log("pdf create", error)
   reject(error) 
}
   

})};

module.exports = generatePDF




