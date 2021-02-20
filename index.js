import fetch from "node-fetch"
import parser from "node-html-parser"
import nodemailer from "nodemailer"

const BASE_URL = "https://www.alza.sk/"
const STATUS_INAVAILABLE = "Tešíme sa"

const getItemAvailabilityStatus = async id => {
  const res = await fetch(
    "https://www.alza.sk/Services/EShopService.svc/GetCommodityAvailabilityControl",
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "sk-SK",
        "cache-control": "no-cache",
        "content-type": "application/json; charset=UTF-8",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        cookie:
          "__uzma=58b8b121-e589-448c-b6c9-4d4825496dec; __uzmb=1613399287; __uzme=0713; VZTX=3230685982; .AspNetCore.Culture=c%3Dsk-SK%7Cuic%3Dsk-SK; __ssds=2; __ssuzjsr2=a9be0cd8e; __uzmaj2=2c1bfb5b-11e1-41e1-a4f6-fd767bf2b2e2; __uzmbj2=1613399289; _gcl_au=1.1.1539440342.1613399291; _hjid=d6e05a19-3ec8-45fa-80ca-9962041db6f8; CriticalCSS=12197710; _gid=GA1.2.619044411.1613721479; SL_C_23361dd035530_VID=difKk7HDVm5; SL_C_23361dd035530_KEY=263616316fc439f9ca1bfc939d7841ab0b310a19; lb_id=1fb683a6eba8681bfe9ed59bcdd45525; TPL=1; _hjTLDTest=1; i18next=sk-SK; CCC=18849879; _hjIncludedInSessionSample=1; _hjAbsoluteSessionInProgress=0; _gat_UA-948269-50=1; sc/graficke-karty-s-cipom-nvidia/18849879.htm=750; hvrcomm=6128456; _ga_3JZ5239MZ4=GS1.1.1613765702.7.1.1613766313.58; _ga=GA1.2.837764596.1613399291; _dc_gtm_UA-948269-50=1; _hjIncludedInPageviewSample=1; __uzmc=3073258377759; __uzmd=1613766326; PVCFLP=49; __uzmcj2=3565618731673; __uzmdj2=1613766326",
      },
      referrer:
        "https://www.alza.sk/msi-geforce-rtx-3070-ventus-3x-oc-d6128456.htm",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: `{"commodityId":${id}}`,
      method: "POST",
      mode: "cors",
    }
  )
  const data = await res.json()
  return data.d.Value
}

const getAllcards = async () => {
  const res = await fetch(
    "https://www.alza.sk/Services/EShopService.svc/Filter",
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "sk-SK",
        "cache-control": "no-cache",
        "content-type": "application/json; charset=UTF-8",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer: "https://www.alza.sk/graficke-karty/18842862.htm",
      referrerPolicy: "strict-origin-when-cross-origin",
      body:
        '{"idCategory":18842862,"producers":"","parameters":[{"from":null,"to":null,"orderFrom":null,"orderTo":null,"typeId":340,"valueTo":null,"values":["239785900","239785898","239785899","239797673","239807474"],"valueIds":["340-239785900","340-239785898","340-239785899","340-239797673","340-239807474"]}],"idPrefix":0,"prefixType":0,"page":1,"pageTo":6,"inStock":false,"newsOnly":false,"commodityStatusType":0,"upperDescriptionStatus":0,"branchId":-2,"sort":0,"categoryType":1,"searchTerm":"","sendProducers":false,"layout":0,"append":false,"leasingCatId":null,"yearFrom":null,"yearTo":null,"artistId":null,"minPrice":-1,"maxPrice":-1,"shouldDisplayVirtooal":false,"callFromParametrizationDialog":false,"commodityWearType":null,"scroll":0,"hash":"#f&cst=0&cud=0&pg=1-6&prod=&par340=340-239785900,340-239785898,340-239785899,340-239797673,340-239807474","counter":1}',
      method: "POST",
      mode: "cors",
    }
  )

  const data = await res.json()
  const html = data.d.Boxes
  const root = parser.parse(html)
  const textDivs = root.querySelectorAll(".pc.browsinglink")
  return textDivs.map(b => b.getAttribute("href"))
}

const sendMail = async (link, id, availabilityStatus) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "hotmail",
    name: "www.example.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "graphics_card_checker@outlook.com", // generated ethereal user
      pass: "PASSWORD", // generated ethereal password
    },
  })

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "graphics_card_checker@outlook.com", // sender address
    to: ["mecir.martin@gmail.com", "michalcik.samo@gmail.com"], // list of receivers
    subject: `Availability status of item ${id} has changed!`, // Subject line
    html: `<h1>Availability status of item ${id} has changed!</h1><p><b>New status:</b> ${availabilityStatus}</p><p><b>Link to an item:</b> ${link}</p>`, // html body
  })

  console.log("Message sent: %s", info.messageId)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

const getRawAvailabilityStatus = html => {
  const root = parser.parse(html)
  const availabilityDiv = root.querySelector(".commodityAvailabilityText")
  const rawAvailability = availabilityDiv.innerHTML
  return rawAvailability.trim()
}

const main = async () => {
  const links = await getAllcards().catch(err => {
    throw new Error("Error while loading list of cards", err)
  })
  const cardIds = links.map(link => link.match(/(?<=-d)[0-9]+(?=\.htm)/g))

  cardIds.forEach(async (id, i) => {
    const html = await getItemAvailabilityStatus(id).catch(err => {
      throw new Error(
        "Error while getting availability status of item with id: " + id,
        err
      )
    })
    let availabilityStatus = getRawAvailabilityStatus(html)
    console.log(BASE_URL + links[i], "\n", availabilityStatus, "\n\n")
    if (availabilityStatus !== STATUS_INAVAILABLE) {
      console.log(
        `Availability status of this item has changed: ${
          BASE_URL + links[i]
        }\nSending email...`
      )
      sendMail(BASE_URL + links[i], id, availabilityStatus)
    }
  })
}
main()
