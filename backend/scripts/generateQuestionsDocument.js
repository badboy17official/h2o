import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, '../exports');
const OUTPUT_FILE = path.resolve(OUTPUT_DIR, 'MCQ_Question_Bank_Round1.docx');

const CATEGORY_ORDER = ['C', 'Python', 'Java', 'SQL'];

function optionParagraph(label, text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text: `${label}) `, bold: true }),
      new TextRun(String(text ?? '')),
    ],
  });
}

async function fetchQuestions() {
  const query = `
    SELECT
      id,
      category,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      difficulty,
      created_at
    FROM questions
    ORDER BY
      CASE category
        WHEN 'C' THEN 1
        WHEN 'Python' THEN 2
        WHEN 'Java' THEN 3
        WHEN 'SQL' THEN 4
        ELSE 999
      END,
      created_at ASC,
      id ASC;
  `;

  const { rows } = await pool.query(query);
  return rows;
}

function groupByCategory(rows) {
  const grouped = {
    C: [],
    Python: [],
    Java: [],
    SQL: [],
  };

  for (const row of rows) {
    if (grouped[row.category]) {
      grouped[row.category].push(row);
    }
  }

  return grouped;
}

function buildDocument(rows) {
  const grouped = groupByCategory(rows);

  const children = [
    new Paragraph({
      text: 'MCQ Question Bank – Hackathon Round 1',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 320 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Total Questions: ${rows.length}`, italics: true }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 480 },
    }),
  ];

  for (const category of CATEGORY_ORDER) {
    const list = grouped[category] || [];

    children.push(
      new Paragraph({
        text: `Language: ${category}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 280, after: 220 },
      })
    );

    list.forEach((q, index) => {
      children.push(
        new Paragraph({
          spacing: { after: 140 },
          children: [
            new TextRun({ text: `Q${index + 1}. `, bold: true }),
            new TextRun(String(q.question_text ?? '')),
          ],
        }),
        optionParagraph('A', q.option_a),
        optionParagraph('B', q.option_b),
        optionParagraph('C', q.option_c),
        optionParagraph('D', q.option_d),
        new Paragraph({
          spacing: { after: 220 },
          children: [
            new TextRun({ text: 'Correct Answer: ', bold: true }),
            new TextRun(String(q.correct_answer ?? '').toUpperCase()),
          ],
        }),
        new Paragraph({ text: '', spacing: { after: 140 } })
      );
    });
  }

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
}

async function generateQuestionsDocument() {
  try {
    const rows = await fetchQuestions();

    if (!rows.length) {
      throw new Error('No questions found in database.');
    }

    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const doc = buildDocument(rows);
    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(OUTPUT_FILE, buffer);

    console.log('✅ Question bank generated successfully');
    console.log(`📄 File: ${OUTPUT_FILE}`);
    console.log(`🧮 Questions exported: ${rows.length}`);
  } catch (error) {
    console.error('❌ Failed to generate question bank document:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

generateQuestionsDocument();
