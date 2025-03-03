import { NextRequest, NextResponse } from "next/server"
import axios from "axios"
import * as cheerio from "cheerio"
import { CACHE_TIME, checkCache, storeCache } from "@/app/utils/cache";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")
  if (!url) {
    return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 })
  }

  const cachedData = await checkCache(url);
  if (cachedData) {
    return NextResponse.json(cachedData, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_TIME}, s-maxage=${CACHE_TIME}`,
      }
    });
  }

  try {
    const { data } = await axios.get(url)
    const $ = cheerio.load(data)
    const tables = $("table.wikitable")
    let extractedData: any[] = []

    tables.each((_, table) => {
      const rows = $(table).find("tr")
      const rowspanTracker: (string | number)[][] = []

      rows.each((rowIndex, row) => {
        if (rowIndex === 0) return

        const cells = $(row).find("td")
        if (cells.length < 2) return

        let rowData: (string | number)[] = []
        let cellIndex = 0

        cells.each((_, cell) => {
          const $cell = $(cell)
          let value = $cell.contents().filter(function() {
            return this.nodeType === 3
          }).text().trim()
          let numericValue = parseFloat(value.replace(/[^0-9.]/g, ""))
          let rowspan = parseInt($cell.attr("rowspan") || "1", 10)

          const parsedDate = Date.parse(value)
          const isDate = !isNaN(parsedDate)

          while (rowspanTracker[rowIndex]?.[cellIndex] !== undefined) {
            rowData.push(rowspanTracker[rowIndex][cellIndex]) 
            cellIndex++
          }

          if (isDate) {
            rowData.push(value)
          } else if (!isNaN(numericValue)) {
            rowData.push(value)

            if (rowspan > 1) {
              for (let i = 1; i < rowspan; i++) {
                if (!rowspanTracker[rowIndex + i]) rowspanTracker[rowIndex + i] = []
                rowspanTracker[rowIndex + i][cellIndex] = numericValue
              }
            }
          }

          cellIndex++
        })

        if (rowData.length > 1) {
          extractedData.push({ label: rowData[0], value: rowData[1] })
        }
      })
    })

    if (extractedData.length === 0) {
      return NextResponse.json({ error: "No numeric data found." }, { status: 404 })
    }

    storeCache(url, extractedData);

    return NextResponse.json(extractedData, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_TIME}, s-maxage=${CACHE_TIME}`,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data." }, { status: 500 })
  }
}