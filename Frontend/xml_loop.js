import fs from 'fs'
let string = ''
for(let i=0; i < 399; i++){
    let urlString = `<url><loc>https://k-stats.com/group/${i+1}</loc><changefreq>hourly</changefreq>
    <priority>0.6</priority></url>`
    string += urlString

}
fs.writeFile('gxml.xml',string, (err) => {
    if (err)
      console.log(err);
    else {
      console.log("File written successfully\n");
      console.log("The written has the following contents:");
    }
  })