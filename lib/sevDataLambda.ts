import * as aws from 'aws-sdk'
import * as https from 'https'
const deliveryStream = new aws.Firehose()

interface sevDataFormat {
  Datestamp: string
  Timestamp: string
  Oil_Sum: number
  Water_Sum: number
  Wind_Sum: number 
  Biogas_Sum: number 
  Sun_Sum: number
  Wind_Neshagi: number
  Wind_Husahagi: number
  Wind_Porkeri: number 
  Wind_Rokt: number
  Sun_Sumba: number
}

interface paramsFormat {
  StreamName: string
  Record: {
    Data: string
  }
}

export const handler = async(event:any) => {
  console.log("request:", JSON.stringify(event, undefined, 2));

  var params = getAndParseSevData(deliveryStreamName)

  console.log('PARAMS: %j', params)

  return deliveryStream.putRecord(params)
}

const getAndParseSevData = async(deliveryStreamName) => {
  const options = {
    hostname: 'www.sev.fo',
    path: '/api/realtimemap/now',
    method: 'GET',
  }
  var sevDataRaw = await getSevData(options)
  var sevDataParsed = await parseSevData(sevDataRaw, deliveryStreamName)
  return sevDataParsed
}

const getSevData = async(options:any) => {
  return new Promise((resolve) => {
    https.request(options, res => {
      let data:any = []
      res.on("data", chunk => {
        data.push(chunk)
      })
      res.on("end",() => {
        data = Buffer.concat(data).toString()
        resolve(data)
      })
    }).end()
  })
}

const parseSevData = async(data:any,deliveryStreamName: String) => {
  var dataJSONed = JSON.parse(data)
  
  var sevData = {
    Datestamp: dataJSONed.tiden.split(" ")[0],
    Timestamp: dataJSONed.tiden.split(" ")[1],
    Oil_Sum: dataJSONed.OlieSev_E.replace(/,/g, '.'),
    Water_Sum: dataJSONed.VandSev_E.replace(/,/g, '.'),
    Wind_Sum: dataJSONed.VindSev_E.replace(/,/g, '.'),
    Biogas_Sum: dataJSONed.BiogasSev_E.replace(/,/g, '.'),
    Sun_Sum: dataJSONed.SolSev_E.replace(/,/g, '.'),
    Wind_Neshagi: dataJSONed.NeVind_E.replace(/,/g, '.'),
    Wind_Husahagi: dataJSONed.HhVind_E.replace(/,/g, '.'),
    Wind_Porkeri: dataJSONed.PoVind_E.replace(/,/g, '.'),
    Wind_Rokt: dataJSONed.RoVind_E.replace(/,/g, '.'),
    Sun_Sumba: dataJSONed.SuSol_E.replace(/,/g, '.')      
  }

  const params = {
    StreamName: deliveryStreamName,
    Record: {
      Data: sevData.toString(), 
    }
  }

  return params
}
