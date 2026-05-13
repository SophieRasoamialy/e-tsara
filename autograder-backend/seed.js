const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Role = require('./models/Role');
const Class = require('./models/Niveau');
const Module = require('./models/Module');
const Subject = require('./models/Matiere');
const Student = require('./models/Etudiant');
const Exam = require('./models/Exam');
const Question = require('./models/Question');
const AnswerQuestion = require('./models/AnswerQuestion');
const AnswerSheet = require('./models/AnswerSheet');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/autograderDB';
const LOCAL_STORAGE_PREFIX = 'local/';
const UPLOADS_ROOT = path.join(__dirname, 'uploads');
const ANSWER_SHEETS_DIR = path.join(UPLOADS_ROOT, 'answer-sheets');
const CORRECTED_ANSWER_SHEETS_DIR = path.join(UPLOADS_ROOT, 'corrected-answer-sheets');

const ROLE_NAMES = ['professeur', 'admin', 'personnel'];

const USER_SEED = [
  {
    email: 'admin@gmail.com',
    name: 'Admin User',
    role: 'admin',
    password: 'admin@1234',
  },
  {
    email: 'enseignant.ig@gmail.com',
    name: 'Rakoto Professeur IG',
    role: 'professeur',
    password: 'prof@1234',
  },
  {
    email: 'enseignant.bd@gmail.com',
    name: 'Rabe Professeur BD',
    role: 'professeur',
    password: 'prof@1234',
  },
  {
    email: 'personnel.scolarite@gmail.com',
    name: 'Personnel Scolarite',
    role: 'personnel',
    password: 'personnel@1234',
  },
];

const CLASS_SEED = [
  { name: 'L1 IG' },
  { name: 'L2 IG' },
  { name: 'M1 IA' },
];

const MODULE_SEED = [
  {
    name: 'UE Programmation 1',
    credit: 6,
    classNames: ['L1 IG'],
  },
  {
    name: 'UE Methodologie',
    credit: 4,
    classNames: ['L1 IG', 'L2 IG'],
  },
  {
    name: 'UE Base de Donnees',
    credit: 6,
    classNames: ['L2 IG'],
  },
  {
    name: 'UE Intelligence Artificielle',
    credit: 8,
    classNames: ['M1 IA'],
  },
];

const SUBJECT_SEED = [
  {
    name: 'Algorithmique',
    coeff: 4,
    teacherEmail: 'enseignant.ig@gmail.com',
    moduleName: 'UE Programmation 1',
  },
  {
    name: 'Developpement Web',
    coeff: 3,
    teacherEmail: 'enseignant.ig@gmail.com',
    moduleName: 'UE Methodologie',
  },
  {
    name: 'Bases de Donnees Relationnelles',
    coeff: 5,
    teacherEmail: 'enseignant.bd@gmail.com',
    moduleName: 'UE Base de Donnees',
  },
  {
    name: 'Apprentissage Automatique',
    coeff: 6,
    teacherEmail: 'enseignant.bd@gmail.com',
    moduleName: 'UE Intelligence Artificielle',
  },
];

const STUDENT_SEED = [
  { matricule: 'L1IG001', name: 'Ando Aina', className: 'L1 IG' },
  { matricule: 'L1IG002', name: 'Mickael Rija', className: 'L1 IG' },
  { matricule: 'L1IG003', name: 'Faneva Toky', className: 'L1 IG' },
  { matricule: 'L1IG004', name: 'Hasina Mirana', className: 'L1 IG' },
  { matricule: 'L1IG005', name: 'Ony Kanto', className: 'L1 IG' },
  { matricule: 'L1IG006', name: 'Rindra Miora', className: 'L1 IG' },
  { matricule: 'L1IG007', name: 'Tahiry Nantenaina', className: 'L1 IG' },
  { matricule: 'L1IG008', name: 'Fenosoa Lova', className: 'L1 IG' },
  { matricule: 'L1IG009', name: 'Hery Fitahiana', className: 'L1 IG' },
  { matricule: 'L2IG001', name: 'Sarah Fitia', className: 'L2 IG' },
  { matricule: 'L2IG002', name: 'Toky Nomena', className: 'L2 IG' },
  { matricule: 'M1IA001', name: 'Tahina Faly', className: 'M1 IA' },
  { matricule: 'M1IA002', name: 'Lova Harena', className: 'M1 IA' },
];

const TARGET_EXAM_CLASS_NAMES = ['L1 IG', 'L2 IG', 'M1 IA'];

const SAMPLE_EXAM_TEMPLATE = {
  session: '1ère session',
  semestre: '1er semestre',
  academicYear: '2025-2026',
  questions: [
    {
      text:
        '1. Vrai ou Faux : Un algorithme est une suite finie et ordonnée d’instructions. Répondez par Vrai ou Faux.',
      answer: 'Vrai',
      wrongAnswer: 'Faux',
    },
    {
      text:
        '2. Cocher la bonne réponse : Quelle structure permet de répéter un bloc d’instructions ? A. Variable  B. Boucle  C. Commentaire  D. Constante',
      answer: 'B. Boucle',
      wrongAnswer: 'A. Variable',
    },
    {
      text:
        '3. Souligner la bonne réponse : Le symbole utilisé pour une condition d’égalité est == / ++ / -- / &&',
      answer: '==',
      wrongAnswer: '++',
    },
    {
      text:
        '4. Cocher la bonne réponse : Quelle structure est la plus adaptée pour représenter une décision ? A. if  B. for  C. string  D. array',
      answer: 'A. if',
      wrongAnswer: 'B. for',
    },
    {
      text:
        '5. Vrai ou Faux : Une boucle while exécute toujours son bloc au moins une fois.',
      answer: 'Faux',
      wrongAnswer: 'Vrai',
    },
    {
      text:
        '6. Cocher la bonne réponse : Quel mot-clé sert à déclarer une constante en JavaScript ? A. let  B. const  C. loop  D. fixed',
      answer: 'B. const',
      wrongAnswer: 'A. let',
    },
    {
      text:
        '7. Souligner la bonne réponse : Pour stocker plusieurs valeurs du même type, on utilise le plus souvent tableau / condition / fonction / commentaire',
      answer: 'tableau',
      wrongAnswer: 'condition',
    },
    {
      text:
        '8. Cocher la bonne réponse : Quelle est la complexité temporelle d’une recherche linéaire dans le pire des cas ? A. O(1)  B. O(log n)  C. O(n)  D. O(n²)',
      answer: 'C. O(n)',
      wrongAnswer: 'B. O(log n)',
    },
    {
      text:
        '9. Vrai ou Faux : Une variable peut changer de valeur pendant l’exécution du programme.',
      answer: 'Vrai',
      wrongAnswer: 'Faux',
    },
    {
      text:
        '10. Cocher la bonne réponse : Quel énoncé permet d’exécuter un bloc si une condition est vraie ? A. return  B. switch  C. if  D. break',
      answer: 'C. if',
      wrongAnswer: 'D. break',
    },
  ],
};

async function connectDB() {
  console.log('mongo uri>>>', MONGO_URI);
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connexion à la base de données réussie.');
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
}

function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function ensureUploadDirs() {
  fs.mkdirSync(ANSWER_SHEETS_DIR, { recursive: true });
  fs.mkdirSync(CORRECTED_ANSWER_SHEETS_DIR, { recursive: true });
}

function escapePdfText(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildSimplePdfBuffer(lines) {
  const contentLines = ['BT', '/F1 11 Tf', '50 800 Td'];
  lines.forEach((line, index) => {
    if (index > 0) {
      contentLines.push('0 -16 Td');
    }
    contentLines.push(`(${escapePdfText(line)}) Tj`);
  });
  contentLines.push('ET');

  const contentStream = contentLines.join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
    `5 0 obj\n<< /Length ${Buffer.byteLength(contentStream, 'utf8')} >>\nstream\n${contentStream}\nendstream\nendobj`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((objectDef) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${objectDef}\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
}

async function seedRoles() {
  for (const roleName of ROLE_NAMES) {
    await Role.findOneAndUpdate(
      { name: roleName },
      { name: roleName },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log('Les rôles ont été ajoutés avec succès.');
  return Role.find({ name: { $in: ROLE_NAMES } });
}

async function seedUsers(roleMap) {
  for (const userSeed of USER_SEED) {
    const role = roleMap.get(userSeed.role);
    if (!role) {
      throw new Error(`Rôle introuvable pour l'utilisateur ${userSeed.email}: ${userSeed.role}`);
    }

    const password_hash = await bcrypt.hash(userSeed.password, 10);
    await User.findOneAndUpdate(
      { email: userSeed.email },
      {
        email: userSeed.email,
        name: userSeed.name,
        password_hash,
        role: role._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log('Les utilisateurs ont été créés ou mis à jour avec succès.');
  return User.find({ email: { $in: USER_SEED.map((user) => user.email) } }).populate('role');
}

async function seedClasses() {
  for (const classSeed of CLASS_SEED) {
    await Class.findOneAndUpdate(
      { name: classSeed.name },
      classSeed,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log('Les classes ont été créées ou mises à jour avec succès.');
  return Class.find({ name: { $in: CLASS_SEED.map((item) => item.name) } });
}

async function seedModules(classMap) {
  for (const moduleSeed of MODULE_SEED) {
    const classIds = moduleSeed.classNames
      .map((className) => classMap.get(className))
      .filter(Boolean)
      .map((classDoc) => classDoc._id);

    if (classIds.length !== moduleSeed.classNames.length) {
      throw new Error(`Impossible de résoudre toutes les classes pour ${moduleSeed.name}`);
    }

    await Module.findOneAndUpdate(
      { name: moduleSeed.name },
      {
        name: moduleSeed.name,
        credit: moduleSeed.credit,
        class_ids: classIds,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log("Les unités d'enseignement ont été créées ou mises à jour avec succès.");
  return Module.find({ name: { $in: MODULE_SEED.map((item) => item.name) } });
}

async function seedSubjects(userMap, moduleMap) {
  for (const subjectSeed of SUBJECT_SEED) {
    const teacher = userMap.get(subjectSeed.teacherEmail);
    const moduleDoc = moduleMap.get(subjectSeed.moduleName);

    if (!teacher) {
      throw new Error(`Enseignant introuvable pour ${subjectSeed.name}: ${subjectSeed.teacherEmail}`);
    }

    if (!moduleDoc) {
      throw new Error(`UE introuvable pour ${subjectSeed.name}: ${subjectSeed.moduleName}`);
    }

    await Subject.findOneAndUpdate(
      { name: subjectSeed.name, module_id: moduleDoc._id },
      {
        name: subjectSeed.name,
        coeff: subjectSeed.coeff,
        teacher_id: teacher._id,
        module_id: moduleDoc._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log('Les matières ont été créées ou mises à jour avec succès.');
}

async function seedStudents(classMap) {
  for (const studentSeed of STUDENT_SEED) {
    const classDoc = classMap.get(studentSeed.className);
    if (!classDoc) {
      throw new Error(`Classe introuvable pour l'étudiant ${studentSeed.matricule}: ${studentSeed.className}`);
    }

    await Student.findOneAndUpdate(
      { matricule: studentSeed.matricule },
      {
        matricule: studentSeed.matricule,
        name: studentSeed.name,
        class_id: classDoc._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log('Les étudiants ont été créés ou mis à jour avec succès.');
}

async function upsertExamQuestions(exam) {
  const expectedQuestionTexts = SAMPLE_EXAM_TEMPLATE.questions.map((item) => item.text);
  const existingQuestions = await Question.find({
    exam_id: exam._id,
    text: { $in: expectedQuestionTexts },
  });
  const existingQuestionMap = new Map(existingQuestions.map((question) => [question.text, question]));

  for (const questionSeed of SAMPLE_EXAM_TEMPLATE.questions) {
    let question = existingQuestionMap.get(questionSeed.text);

    if (!question) {
      question = await Question.create({
        exam_id: exam._id,
        text: questionSeed.text,
        answer_type: 'QCM',
        answer_duplicated: true,
        points: 2,
      });
      existingQuestionMap.set(questionSeed.text, question);
    } else {
      question.answer_type = 'QCM';
      question.answer_duplicated = true;
      question.points = 2;
      await question.save();
    }

    await AnswerQuestion.findOneAndUpdate(
      { question_id: question._id },
      { question_id: question._id, answer: questionSeed.answer },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

async function seedSampleExams(classMap) {
  const targetClassDocs = TARGET_EXAM_CLASS_NAMES
    .map((className) => classMap.get(className))
    .filter(Boolean);

  if (targetClassDocs.length !== TARGET_EXAM_CLASS_NAMES.length) {
    throw new Error("Impossible de résoudre toutes les classes cibles pour les sujets d'examen.");
  }

  const subjects = await Subject.find().populate('module_id');
  let createdExamCount = 0;

  for (const classDoc of targetClassDocs) {
    const subjectsForClass = subjects.filter((subject) =>
      subject.module_id &&
      Array.isArray(subject.module_id.class_ids) &&
      subject.module_id.class_ids.some((classId) => classId.toString() === classDoc._id.toString())
    );

    for (const subject of subjectsForClass) {
      const titre = `QCM ${subject.name} - ${classDoc.name}`;
      const exam = await Exam.findOneAndUpdate(
        { titre, subject_id: subject._id },
        {
          titre,
          session: SAMPLE_EXAM_TEMPLATE.session,
          semestre: SAMPLE_EXAM_TEMPLATE.semestre,
          academicYear: SAMPLE_EXAM_TEMPLATE.academicYear,
          subject_id: subject._id,
          class_ids: [classDoc._id],
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      await upsertExamQuestions(exam);
      createdExamCount += 1;
    }
  }

  console.log(`Les sujets d'examen exemple ont été créés ou mis à jour avec succès pour ${createdExamCount} examens.`);
}

function buildStudentAnswers(questionSeeds, variant) {
  return questionSeeds.map((questionSeed, index) => {
    const shouldBeWrong = (variant + index) % 3 === 0;
    return shouldBeWrong ? questionSeed.wrongAnswer : questionSeed.answer;
  });
}

function computeNote(questionSeeds, studentAnswers) {
  return questionSeeds.reduce((total, questionSeed, index) => {
    return total + (studentAnswers[index] === questionSeed.answer ? 2 : 0);
  }, 0);
}

async function createAnswerSheetPdf({ outputPath, title, subtitle, student, questions, answers, note, corrected }) {
  const outputLines = [];
  const wrapText = (text, maxChars = 90) => {
    const words = text.split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > maxChars) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }

    if (current) {
      lines.push(current);
    }

    return lines;
  };

  outputLines.push(title);
  outputLines.push(subtitle);
  outputLines.push(`Étudiant: ${student.name} (${student.matricule})`);
  if (corrected) {
    outputLines.push(`Note proposée: ${note}/20`);
  }
  outputLines.push('');

  questions.forEach((questionSeed, index) => {
    wrapText(questionSeed.text, 82).forEach((line) => outputLines.push(line));

    outputLines.push(`Réponse de l'étudiant: ${answers[index]}`);

    if (corrected) {
      outputLines.push(`Réponse attendue: ${questionSeed.answer}`);
      outputLines.push(`Points: ${answers[index] === questionSeed.answer ? 2 : 0}/2`);
    }

    outputLines.push('');
  });

  fs.writeFileSync(outputPath, buildSimplePdfBuffer(outputLines));
}

async function seedAnswerSheetsForSampleExams() {
  ensureUploadDirs();

  const exams = await Exam.find({
    titre: { $regex: '^QCM ' },
    academicYear: SAMPLE_EXAM_TEMPLATE.academicYear,
  }).populate('subject_id').populate('class_ids');

  let answerSheetCount = 0;

  for (const exam of exams) {
    const students = await Student.find({ class_id: { $in: exam.class_ids.map((item) => item._id) } });
    const questions = await Question.find({ exam_id: exam._id }).sort({ createdAt: 1 });
    const expectedAnswers = await AnswerQuestion.find({
      question_id: { $in: questions.map((question) => question._id) },
    });
    const questionAnswerMap = new Map(
      expectedAnswers.map((answerDoc) => [answerDoc.question_id.toString(), answerDoc.answer])
    );

    const orderedQuestionSeeds = questions.map((question) => {
      const templateQuestion = SAMPLE_EXAM_TEMPLATE.questions.find(
        (item) => item.text === question.text
      );
      return {
        text: question.text,
        answer: questionAnswerMap.get(question._id.toString()) || (templateQuestion ? templateQuestion.answer : ''),
        wrongAnswer: templateQuestion ? templateQuestion.wrongAnswer : 'Réponse incorrecte',
      };
    });

    for (const [studentIndex, student] of students.entries()) {
      const variant = studentIndex + exams.indexOf(exam);
      const studentAnswers = buildStudentAnswers(orderedQuestionSeeds, variant);
      const note = computeNote(orderedQuestionSeeds, studentAnswers);

      const fileBaseName = `${slugify(exam.titre)}-${slugify(student.matricule)}`;
      const answerRelativePath = path.join('answer-sheets', `${fileBaseName}.pdf`);
      const correctedRelativePath = path.join('corrected-answer-sheets', `${fileBaseName}-corrected.pdf`);
      const answerAbsolutePath = path.join(UPLOADS_ROOT, answerRelativePath);
      const correctedAbsolutePath = path.join(UPLOADS_ROOT, correctedRelativePath);

      await createAnswerSheetPdf({
        outputPath: answerAbsolutePath,
        title: exam.titre,
        subtitle: `Session: ${exam.session} | Semestre: ${exam.semestre} | Année: ${exam.academicYear}`,
        student,
        questions: orderedQuestionSeeds,
        answers: studentAnswers,
        note,
        corrected: false,
      });

      await createAnswerSheetPdf({
        outputPath: correctedAbsolutePath,
        title: `${exam.titre} - Corrigé`,
        subtitle: `Session: ${exam.session} | Semestre: ${exam.semestre} | Année: ${exam.academicYear}`,
        student,
        questions: orderedQuestionSeeds,
        answers: studentAnswers,
        note,
        corrected: true,
      });

      await AnswerSheet.findOneAndUpdate(
        {
          student_matricule: student._id,
          subject_id: exam.subject_id._id,
          exam_id: exam._id,
        },
        {
          student_matricule: student._id,
          subject_id: exam.subject_id._id,
          exam_id: exam._id,
          sheet: `${LOCAL_STORAGE_PREFIX}${answerRelativePath}`,
          sheet_corrige: `${LOCAL_STORAGE_PREFIX}${correctedRelativePath}`,
          note,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      answerSheetCount += 1;
    }
  }

  console.log(`Les feuilles de copie exemple ont été créées ou mises à jour avec succès pour ${answerSheetCount} copies.`);
}

function toMap(items, keyField) {
  return new Map(items.map((item) => [item[keyField], item]));
}

async function runSeedScripts() {
  await connectDB();

  try {
    const roles = await seedRoles();
    const roleMap = toMap(roles, 'name');

    const users = await seedUsers(roleMap);
    const userMap = toMap(users, 'email');
    const classes = await seedClasses();
    const classMap = toMap(classes, 'name');

    const modules = await seedModules(classMap);
    const moduleMap = toMap(modules, 'name');
    await seedSubjects(userMap, moduleMap);
    await seedStudents(classMap);
    await seedSampleExams(classMap);
    await seedAnswerSheetsForSampleExams();

    console.log('Seed terminé.');
    console.log('Comptes disponibles :');
    users.forEach((user) => {
      const seededUser = USER_SEED.find((item) => item.email === user.email);
      if (!seededUser) {
        return;
      }

      console.log(
        `- ${user.role.name}: ${user.email} / ${seededUser.password}`
      );
    });
  } catch (error) {
    console.error('Erreur pendant le seed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runSeedScripts();
