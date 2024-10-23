const swaggerJsdoc = require('swagger-jsdoc');

// Configuration Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Documentation de l\'API pour l\'application',
    },
    servers: [
      {
        url: 'http://ab99fafc3a94f4d68bfb664996b58dc1-1276899171.us-east-1.elb.amazonaws.com', 
        description: 'Serveur local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Etudiant: {
          type: 'object',
          required: ['matricule', 'name', 'class_id'],
          properties: {
            matricule: {
              type: 'string',
              description: 'Identifiant unique de l\'étudiant',
              example: '123456',
            },
            name: {
              type: 'string',
              description: 'Nom complet de l\'étudiant',
              example: 'Jean Dupont',
            },
            class_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID de la classe à laquelle l\'étudiant appartient (référence à la collection `Class`)',
              example: '60b8d295f1b2c2b1d1f1e8d6',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date et heure de création de l\'étudiant',
              example: '2023-08-01T14:15:22Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date et heure de la dernière mise à jour de l\'étudiant',
              example: '2023-08-02T09:34:11Z',
            },
          },
        },
        Module: {
          type: 'object',
          required: ['name', 'credit', 'class_id'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identifiant unique du module',
              example: '60c72b2f9b1d8c3f58f1b60b',
            },
            name: {
              type: 'string',
              description: 'Nom du module',
              example: 'Mathématiques',
            },
            credit: {
              type: 'number',
              description: 'Note maximale du module',
              example: 5,
            },
            class_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID de la classe à laquelle le module est associé (référence à la collection `Class`)',
              example: '60b8d295f1b2c2b1d1f1e8d6',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date et heure de création du module',
              example: '2023-07-01T14:15:22Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date et heure de la dernière mise à jour du module',
              example: '2023-07-02T09:34:11Z',
            },
          },
        },
        Class: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identifiant unique de la classe',
              example: '60c72b2f9b1d8c3f58f1b60c',
            },
            name: {
              type: 'string',
              description: 'Nom de la classe',
              example: 'Classe de Terminale',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date et heure de création de la classe',
              example: '2023-06-01T14:15:22Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date et heure de la dernière mise à jour de la classe',
              example: '2023-06-02T09:34:11Z',
            },
          },
        },
        Exam: {
          type: 'object',
          required: ['session', 'semestre', 'subject_id', 'date'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identifiant unique de l\'examen',
              example: '60c72b2f9b1d8c3f58f1b60a',
            },
            session: {
              type: 'string',
              enum: ['1ère session', 'rattrapage'],
              description: 'Session de l\'examen',
              example: '1ère session',
            },
            semestre: {
              type: 'string',
              enum: ['1er semestre', '2ème semestre'],
              description: 'Semestre de l\'examen',
              example: '1er semestre',
            },
            subject_id: {
              type: 'string',
              format: 'uuid',
              description: 'Identifiant de la matière associée à l\'examen',
              example: '60c72b2f9b1d8c3f58f1b60a',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Date de l\'examen',
              example: '2023-08-01T10:00:00Z',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création de l\'examen',
              example: '2023-07-01T14:15:22Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière mise à jour de l\'examen',
              example: '2023-07-02T09:34:11Z',
            },
          },
        },
        Question: {
          type: 'object',
          required: ['exam_id', 'text', 'answer_type', 'points'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identifiant unique de la question',
              example: '60c72b2f9b1d8c3f58f1b60d',
            },
            exam_id: {
              type: 'string',
              format: 'uuid',
              description: 'Identifiant de l\'examen associé à la question',
              example: '60c72b2f9b1d8c3f58f1b60a',
            },
            text: {
              type: 'string',
              description: 'Texte de la question',
              example: 'Quelle est la capitale de la France?',
            },
            answer_type: {
              type: 'string',
              enum: ['texte', 'QCM', 'vrai ou faux', 'compléter', 'conception'],
              description: 'Type de réponse attendu',
              example: 'texte',
            },
            answer_duplicated: {
              type: 'boolean',
              description: 'Permettre les réponses dupliquées',
              example: false,
            },
            points: {
              type: 'number',
              description: 'Points associés à la question',
              example: 10,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création de la question',
              example: '2023-07-01T14:15:22Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière mise à jour de la question',
              example: '2023-07-02T09:34:11Z',
            },
          },
        },
        AnswerQuestion: {
          type: 'object',
          required: ['question_id', 'answer'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identifiant unique de la réponse',
              example: '60c72b2f9b1d8c3f58f1b60e',
            },
            question_id: {
              type: 'string',
              format: 'uuid',
              description: 'Identifiant de la question à laquelle la réponse appartient',
              example: '60c72b2f9b1d8c3f58f1b60d',
            },
            answer: {
              type: 'object',
              description: 'Réponse à la question',
              example: {
                text: 'Paris',
                image: 'url_to_image',
                table: 'table_data',
              },
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création de la réponse',
              example: '2023-07-01T14:15:22Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière mise à jour de la réponse',
              example: '2023-07-02T09:34:11Z',
            },
          },
        },
        Subject: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description: 'Identifiant unique du sujet',
                example: '60b8d295f1b2c2b1d1f1e8d6'
              },
              name: {
                type: 'string',
                description: 'Nom du sujet',
                example: 'Mathematics'
              },
              coeff: {
                type: 'number',
                description: 'Coefficient du sujet',
                example: 5
              },
              teacher_id: {
                type: 'string',
                format: 'uuid',
                description: 'Identifiant de l\'enseignant (référence à l\'utilisateur)',
                example: '60b8d295f1b2c2b1d1f1e8d6'
              },
              module_id: {
                type: 'string',
                format: 'uuid',
                description: 'Identifiant du module (référence au module)',
                example: '60b8d295f1b2c2b1d1f1e8d6'
              },
              created_at: {
                type: 'string',
                format: 'date-time',
                description: 'Date et heure de création du sujet',
                example: '2023-08-01T14:15:22Z'
              },
              updated_at: {
                type: 'string',
                format: 'date-time',
                description: 'Date et heure de la dernière mise à jour du sujet',
                example: '2023-08-02T09:34:11Z'
              }
            },
            required: ['name', 'coeff', 'teacher_id', 'module_id'],
          },
          User: {
            type: 'object',
            required: [
              'username',
              'name',
              'password_hash',
              'role',
            ],
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description: 'Identifiant unique de l\'utilisateur',
                example: '60b8d295f1b2c2b1d1f1e8d6',
              },
              username: {
                type: 'string',
                description: 'Nom d\'utilisateur unique',
                example: 'jdoe',
              },
              name: {
                type: 'string',
                description: 'Nom complet de l\'utilisateur',
                example: 'John Doe',
              },
              password_hash: {
                type: 'string',
                description: 'Hash du mot de passe de l\'utilisateur',
                example: 'hashed_password_here',
              },
              role: {
                type: 'string',
                description: 'Rôle de l\'utilisateur dans le système',
                example: 'professeur',
              },
              created_at: {
                type: 'string',
                format: 'date-time',
                description: 'Date et heure de création du compte',
                example: '2023-08-01T14:15:22Z',
              },
              updated_at: {
                type: 'string',
                format: 'date-time',
                description: 'Date et heure de la dernière mise à jour du compte',
                example: '2023-08-02T09:34:11Z',
              },
            },
          },
          AnswerSheet: {
            type: 'object',
            required: [
              'student_matricule',
              'sheet',
              'subject_id',
              'exam_id'
            ],
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description: 'Identifiant unique de la feuille de réponse',
                example: '60b8d295f1b2c2b1d1f1e8d6',
              },
              student_matricule: {
                type: 'string',
                format: 'uuid',
                description: 'Identifiant de l\'étudiant',
                example: '60b8d295f1b2c2b1d1f1e8d7',
              },
              sheet: {
                type: 'string',
                description: 'Chemin vers le fichier PDF de la feuille de réponse',
                example: '/path/to/answer_sheet.pdf',
              },
              sheet_corrige: {
                type: 'string',
                description: 'Chemin vers le fichier PDF corrigé (optionnel)',
                example: '/path/to/corrected_sheet.pdf',
              },
              note: {
                type: 'number',
                description: 'Note attribuée pour la feuille de réponse',
                example: 85,
              },
              subject_id: {
                type: 'string',
                format: 'uuid',
                description: 'Identifiant de la matière',
                example: '60b8d295f1b2c2b1d1f1e8d8',
              },
              exam_id: {
                type: 'string',
                format: 'uuid',
                description: 'Identifiant de l\'examen',
                example: '60b8d295f1b2c2b1d1f1e8d9',
              },
              created_at: {
                type: 'string',
                format: 'date-time',
                description: 'Date et heure de création de la feuille de réponse',
                example: '2023-08-01T14:15:22Z',
              },
              updated_at: {
                type: 'string',
                format: 'date-time',
                description: 'Date et heure de la dernière mise à jour de la feuille de réponse',
                example: '2023-08-02T09:34:11Z',
              },
            },
          },
          Notification: {
            type: 'object',
            required: ['recipient_id', 'title', 'message', 'type'],
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description: 'Identifiant unique de la notification',
                example: '60b8d295f1b2c2b1d1f1e8d6',
              },
              recipient_id: {
                type: 'string',
                format: 'uuid',
                description: 'ID de l\'utilisateur destinataire de la notification',
                example: '60b8d295f1b2c2b1d1f1e8d7',
              },
              title: {
                type: 'string',
                description: 'Titre de la notification',
                example: 'Nouvelle mise à jour disponible',
              },
              message: {
                type: 'string',
                description: 'Message de la notification',
                example: 'Une nouvelle mise à jour est disponible pour votre application.',
              },
              type: {
                type: 'string',
                enum: ['info', 'warning', 'success', 'error'],
                description: 'Type de notification',
                example: 'info',
              },
              read: {
                type: 'boolean',
                description: 'Indicateur si la notification a été lue',
                example: false,
              },
              created_at: {
                type: 'string',
                format: 'date-time',
                description: 'Date et heure de création de la notification',
                example: '2023-08-01T14:15:22Z',
              },
            },
          },
      },
    },
  },
  apis: ['./routes/*.js'], 
};

const specs = swaggerJsdoc(swaggerOptions);

module.exports = specs;
