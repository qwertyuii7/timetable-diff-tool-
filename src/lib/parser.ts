import * as xlsx from 'xlsx';

export type RawRow = Record<string, string>;

export const parseFile = async (file: File): Promise<RawRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = xlsx.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = xlsx.utils.sheet_to_json<RawRow>(worksheet, { defval: "" });
        
        // Convert all keys and string values to strings and trim
        const cleanedJson = json.map(row => {
          const newRow: RawRow = {};
          for (const key in row) {
            newRow[key] = String(row[key]).trim();
          }
          return newRow;
        });

        resolve(cleanedJson);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};

export const normalizeDay = (day: string): string => {
  if (!day) return '';
  const d = day.trim().toLowerCase();
  if (d.startsWith('mo')) return 'Mon';
  if (d.startsWith('tu')) return 'Tue';
  if (d.startsWith('we')) return 'Wed';
  if (d.startsWith('th')) return 'Thu';
  if (d.startsWith('fr')) return 'Fri';
  if (d.startsWith('sa')) return 'Sat';
  if (d.startsWith('su')) return 'Sun';
  return day.trim();
};

export const normalizeTime = (time: string): string => {
  if (!time) return '';
  const t = time.trim().toLowerCase();
  let timeStr = t;
  let modifier = '';

  if (t.endsWith('am') || t.endsWith('pm')) {
    modifier = t.slice(-2);
    timeStr = t.slice(0, -2).trim();
  } else if (t.includes('am')) {
      modifier = 'am';
      timeStr = t.replace('am', '').trim();
  } else if (t.includes('pm')) {
      modifier = 'pm';
      timeStr = t.replace('pm', '').trim();
  }
  
  if (!timeStr) return time.trim();

  const [hours, minutes = '00'] = timeStr.split(':');

  let hrs = parseInt(hours, 10);
  if (isNaN(hrs)) return time.trim();

  if (modifier === 'pm' && hrs < 12) hrs += 12;
  if (modifier === 'am' && hrs === 12) hrs = 0;

  const hh = hrs.toString().padStart(2, '0');
  const mm = minutes.padStart(2, '0');
  return `${hh}:${mm}`;
};
