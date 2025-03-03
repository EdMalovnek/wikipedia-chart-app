# Wikipedia Chart Generator

A super simple web app that uses Next.js App Router to take in a Wikipedia URL and generate a Chart based on a table fgound with Numerica data columns

![image](https://github.com/user-attachments/assets/2c9a8100-1be7-4696-acf8-555704be7e81)

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Packages Used
- axios: For the api calls
- cheerio: for the wikipedia scraping
- recharts: for the chart creation
- tailwind: for the component styling

## My "Wow!" Feature

I decided to make use of the local cache to store previously generated URLs so that the user could easily retrspecitvely see their previous charts!

## Future State

- We could utilise a redis cache to persist the data generated across users and sessions
- We could expand the ability of the chart generation to not only scrape numeric values, but be able to show better labels and more meaningful data from non numeric columns
- Implement a more dynamic page giving the user the option to choose different table types
