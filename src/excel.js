﻿const ExcelJS = require('./module/exceljs.min.js')
const readData = require('./getData').readData
const { app, ipcMain, dialog } = require('electron')
const fs = require('fs-extra')
const path = require('path')
const main =  require('./main')

const sendMsg = (text) => {
  const win = main.getWin()
  if (win) {
    win.webContents.send('LOAD_DATA_STATUS', text)
  }
}

function pad(num) {
  return `${num}`.padStart(2, "0");
}

function getTimeString() {
  const d = new Date();
  const YYYY = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const DD = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${YYYY}${MM}${DD}_${HH}${mm}${ss}`;
}

const start = async () => {
  const data = await readData()
  // https://github.com/sunfkny/genshin-gacha-export-js/blob/main/index.js
  const workbook = new ExcelJS.Workbook()
  for (let [key, value] of data.result) {
    const name = data.typeMap.get(key)
    const sheet = workbook.addWorksheet(name, {views: [{state: 'frozen', ySplit: 1}]})
    sheet.columns = [
      { header: "Timestamp", key: "time", width: 24 },
      { header: "Reward Name", key: "name", width: 35 },
      { header: "Reward Type", key: "type", width: 15 },
      { header: "Rarity (Star)", key: "rank", width: 15 },
      { header: "Wish Count", key: "idx", width: 15 },
      { header: "Pity Count", key: "pdx", width: 15 },
    ]
    // get gacha logs
    const logs = value
    idx = 0
    pdx = 0
    for (log of logs){
      idx += 1
      pdx += 1
      log.push(idx,pdx)
      if (log[3] === 5) {
        pdx = 0
      }
    }
    // sendMsg(logs)
    sheet.addRows(logs)
    // set xlsx hearer style
    ;(["A", "B", "C", "D","E","F"]).forEach((v) => {
      sheet.getCell(`${v}1`).border = {
        top: {style:'thin', color: {argb:'ffc4c2bf'}},
        left: {style:'thin', color: {argb:'ffc4c2bf'}},
        bottom: {style:'thin', color: {argb:'ffc4c2bf'}},
        right: {style:'thin', color: {argb:'ffc4c2bf'}}
      }
      sheet.getCell(`${v}1`).fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb:'ffdbd7d3'},
      }
      sheet.getCell(`${v}1`).font ={
        name: 'Arial',
        color: { argb: "ff757575" },
        bold : true
      }

    })
    // set xlsx cell style
    logs.forEach((v, i) => {
      ;(["A", "B", "C", "D","E","F"]).forEach((c) => {
        sheet.getCell(`${c}${i + 2}`).border = {
          top: {style:'thin', color: {argb:'ffc4c2bf'}},
          left: {style:'thin', color: {argb:'ffc4c2bf'}},
          bottom: {style:'thin', color: {argb:'ffc4c2bf'}},
          right: {style:'thin', color: {argb:'ffc4c2bf'}}
        }
        sheet.getCell(`${c}${i + 2}`).fill = {
          type: 'pattern',
          pattern:'solid',
          fgColor:{argb:'ffebebeb'},
        }
        // rare rank background color
        const rankColor = {
          3: "ff8e8e8e",
          4: "ffa256e1",
          5: "ffbd6932",
        }
        sheet.getCell(`${c}${i + 2}`).font = {
          name: 'Arial',
          color: { argb: rankColor[v[3]] },
          bold : v[3]!="3"
        }
      })
    })
  }

  sendMsg("Готово!")

  sendMsg("Экспорт...")
  const buffer = await workbook.xlsx.writeBuffer()
  const filePath = dialog.showSaveDialogSync({
    defaultPath: path.join(app.getPath('downloads'), `Genshin_Wish_History_${getTimeString()}`),
    filters: [
      { name: 'Excel', extensions: ['xlsx'] }
    ]
  })
  if (filePath) {
    await fs.ensureFile(filePath)
    await fs.writeFile(filePath, buffer)
    sendMsg("Экспорт завершен.")
  }
}

ipcMain.handle('SAVE_EXCEL', async () => {
  await start()
})