const fs = require('fs');
const HTMLtoDOCX = require('html-to-docx');
const express = require("express");
const path = require('path');
const multer = require("multer");
const bodyParser = require("body-parser");
// const afterLoad=require('after-load');
const axios = require('axios');
const https = require('https');

var cors = require('cors')
const app = express();
const port = 3000;

app.set("view engine", "ejs");

const upload = multer();
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Define a route to render the HTML page
app.get("/docconvert/", (req, res) => {
    const nodeVersion = process.version;
    const data = {
        title: "Node.js HTML Rendering",
        message: "Node.js: " + nodeVersion,
    };
    res.render("index", data);
});

app.post("/docconvert/convert-from-html", upload.none(), (req, res) => {
    var { html, filename } = req.body;


    (async () => {
        const fileBuffer = await HTMLtoDOCX(html, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
        });

        const fileName = filename;
        const fileFullName = fileName + ".docx";
        const filePath = './public/' + fileFullName;
        const currentDomain = req.headers.host || 'Unknown';
        const fileUrl = "https://" + currentDomain +  fileFullName;

        console.log({ fileName: fileName, fileUrl: fileUrl })
        fs.writeFile(filePath, fileBuffer, (error) => {
            if (error) {
                console.log('Docx file creation failed');
                res.status(500).json({ error: error });
            }
            res.json({ fileName: fileName, fileUrl: fileUrl });
            console.log('Docx file created successfully');
        });
    })();
});

app.post("/docconvert/convert-from-url", upload.none(), async (req, res) => {
    var { url, filename } = req.body;

    axios.get(url)
        .then((response) => {
            const htmlCode = response.data;
            console.log(htmlCode);
            (async () => {
                const fileBuffer = await HTMLtoDOCX(htmlCode, null, {
                    table: { row: { cantSplit: true } },
                    footer: true,
                    pageNumber: true,
                });

                const fileName = filename;
                const fileFullName = fileName + ".docx";
                const filePath = './public/' + fileFullName;
                const currentDomain = req.headers.host || 'Unknown';
                const fileUrl = "https://" + currentDomain + '/docconvert/' + fileFullName;

                console.log({ fileName: fileName, fileUrl: fileUrl })
                fs.writeFile(filePath, fileBuffer, (error) => {
                    if (error) {
                        console.log('Docx file creation failed');
                        res.status(500).json({ error: error });
                    }
                    res.json({ fileName: fileName, fileUrl: fileUrl });
                    console.log('Docx file created successfully');
                });
            })();

        })
        .catch((error) => {
            console.error('Error fetching HTML:', error.message);
            console.log('Docx file creation failed');
            res.status(500).json({ error: error });
        });


    // https.get(url, (response) => {
    //     let html = '';

    //     // Concatenate the received chunks of data to build the complete HTML content
    //     response.on('data', (chunk) => {
    //         html += chunk;
    //     });

    //     // Once all data is received, handle the complete HTML content
    //     response.on('end', () => {
    //         console.log(html); // Output the HTML content here or perform further processing
    //     });
    // }).on('error', (error) => {
    //     console.error('Error fetching URL:', error);
    // });
    // res.send();
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

function convertArrayToString(arr) {
    if (Array.isArray(arr)) {
        return arr.join('');
    } else {
        return String(arr);
    }
}
