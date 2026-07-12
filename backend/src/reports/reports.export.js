import { Parser } from 'json2csv';

/**
 * Utility function to convert JSON objects array into standard downloadable CSV.
 * Sets appropriate response headers and sends the response.
 */
export const exportToCSV = (res, filename, data, fields) => {
  try {
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (error) {
    throw error;
  }
};
