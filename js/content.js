/* Metadatos de cada pantalla. Los guiones son los del storyboard aprobado (Zona 4). */
var META = {
  titulo: 'Sistemas de Alerta Temprana basados en Machine Learning para la Predicción de Deserción Estudiantil en Educación Superior',
  autor: 'Brahan Julian Garcia Solorzano',
  anio: '2026'
};

var SCREENS = [
  { id: 'p01', n: 1, mod: 1, menu: 'Portada', title: 'Portada', layout: 'big', pose: 'saludo', flags: [], enter: true,
    bubble: '¡Hola! Soy BRAI, tu guía en este recorrido.',
    guion: ['Bienvenido. Soy BRAI, tu acompañante en este recorrido de aprendizaje por los Sistemas de Alerta Temprana basados en Machine Learning con el cual lograremos predecir la deserción estudiantil en educación superior.',
      'A lo largo de este recorrido se validará por qué la deserción es un problema crítico en las universidades latinoamericanas, qué herramientas de inteligencia artificial se están usando para anticiparla, y cómo los sistemas de alerta temprana pueden llegar a transformar la retención estudiantil.',
      'El contenido de este ODC es muy interactivo. Puedes avanzar con las flechas, regresar para repasar y participar en las actividades de cada uno de los módulos.'] },

  { id: 'p02', n: 2, mod: 1, menu: 'Introducción y navegación', title: 'Módulo 1: Introducción y navegación', layout: 'big', pose: 'senala', flags: [],
    bubble: 'Este es el camino que recorreremos juntos.',
    guion: ['En esta pantalla se encontrará la tabla de contenido del ODC. Cada módulo habla de un componente importante para lograr comprender cómo el machine learning puede ayudar en la prevención de la deserción estudiantil.',
      'Comenzaremos primero entendiendo el problema de la deserción estudiantil, luego exploraremos las herramientas de Machine Learning, las variables predictivas, los modelos más efectivos, los sistemas de alerta temprana, la explicabilidad de las predicciones y finalmente casos reales en Latinoamérica.',
      'Cada uno de los módulos incluye una actividad interactiva para reforzar tu aprendizaje.'] },

  { id: 'p03', n: 3, mod: 2, menu: 'La deserción estudiantil', title: 'Módulo 2: La deserción estudiantil', pose: 'senala', flags: ['cejas', 'triste'],
    bubble: '¿Sabías que la mitad de los estudiantes en Latinoamérica abandona?',
    guion: ['Vamos a explorar uno de los problemas más críticos de la educación superior: la deserción estudiantil.',
      '¿Sabías que en regiones en desarrollo las tasas de deserción pueden alcanzar hasta el 50%? En América Latina la situación es muy preocupante. Colombia ha establecido el sistema SPADIES para monitorear y prevenir este fenómeno en la educación.',
      'En este módulo entenderemos la dimensión del problema, sus causas principales, los marcos teóricos que explican la permanencia estudiantil, y por qué necesitamos herramientas inteligentes basadas en datos para abordar la deserción estudiantil.'] },

  { id: 'p04', n: 4, mod: 2, menu: 'Actividad: clasifica los factores', title: 'Módulo 2 · Actividad', pose: 'arriba', flags: [], activity: true,
    bubble: '¡Arrastra cada factor a su categoría!',
    guion: ['Ahora es tu turno de participar. En esta actividad deberás clasificar diferentes factores de deserción según la categoría de cada uno.',
      'Arrastra cada factor hacia la categoría correspondiente: académico, socioeconómico, psicosocial, demográfico, digital o institucional.',
      'Recuerda que la investigación muestra que los modelos de predicción se enfocan principalmente en datos académicos, dejando subrepresentados factores psicosociales como la autoeficacia y el sentido de pertenencia.'] },

  { id: 'p05', n: 5, mod: 3, menu: 'Fundamentos de Machine Learning', title: 'Módulo 3: Fundamentos de ML', pose: 'profesor', flags: ['puntero'],
    bubble: 'Toca cada tarjeta para conocer el algoritmo.',
    guion: ['En este módulo exploraremos los fundamentos del machine learning aplicado a la predicción de deserción estudiantil.',
      'El machine learning o aprendizaje automático permite que los computadores aprendan patrones a partir de datos históricos de estudiantes para identificar quiénes tienen mayor riesgo de abandonar sus estudios académicos.',
      'Los algoritmos más utilizados en este campo son Random Forest, presente en más del 81% de los estudios, XGBoost con la mayor precisión promedio del 87.4%, y los métodos ensemble que combinan varios modelos para alcanzar hasta el 88% de precisión.',
      'Vamos a ver cada uno de estos algoritmos en detalle para saber cómo se aplican en el contexto de educación superior.'] },

  { id: 'p06', n: 6, mod: 3, menu: 'Actividad: algoritmos de ML', title: 'Módulo 3 · Actividad', pose: 'barbilla', flags: ['pensar'], activity: true,
    bubble: '¡Pon a prueba lo que aprendiste!',
    guion: ['Pon a prueba lo que has aprendido sobre los algoritmos de machine learning en predicción de deserción.',
      'Responde las siguientes preguntas de selección múltiple. Recuerda que cada algoritmo tiene fortalezas particulares: Random Forest es el más popular, el de XGBoost el más preciso individualmente, y los ensambles stacking logran los mejores resultados combinando varios modelos predictivos.'] },

  { id: 'p07', n: 7, mod: 4, menu: 'Variables y factores predictivos', title: 'Módulo 4: Variables y factores', pose: 'lupa', flags: ['lupa'],
    bubble: 'No todas las variables pesan igual.',
    guion: ['En este módulo analizaremos las variables que alimentan los modelos de predicción de deserción.',
      'Los factores académicos como el promedio de notas del primer semestre y la reprobación de materias son los más utilizados, apareciendo en más del 96% de los estudios. Sin embargo, factores psicosociales como la motivación y el sentido de pertenencia, que la teoría educativa considera fundamentales, están subrepresentados en los modelos actuales.',
      'También veremos un desafío técnico importante: el desbalance de datos. En un dataset típico, por cada estudiante que deserta hay hasta 9 que permanecen, lo que complica la detección temprana.'] },

  { id: 'p08', n: 8, mod: 4, menu: 'Actividad: ordena las variables', title: 'Módulo 4 · Actividad', pose: 'barbilla', flags: ['pensar'], activity: true,
    bubble: '¿Cuál crees que es el predictor estrella?',
    guion: ['Es momento de practicar. En esta actividad deberás ordenar las variables predictivas según su frecuencia de uso en la investigación.',
      'Piensa en cuáles variables son más fáciles de recolectar para las universidades y cuáles son las que más aportan a la predicción. Esto te dará una idea de por qué algunos factores dominan los modelos.'] },

  { id: 'p09', n: 9, mod: 5, menu: 'Modelos de predicción', title: 'Módulo 5: Modelos de predicción', pose: 'senala', flags: [],
    bubble: 'XGBoost lidera, pero combinar modelos también funciona.',
    guion: ['En este módulo profundizaremos en los modelos de predicción más efectivos y sus resultados.',
      'Veremos cómo un pipeline modular compara 9 algoritmos diferentes, donde XGBoost sobresale con un AUC-ROC de 0.993. También exploraremos cómo la combinación de modelos en una arquitectura stacking puede elevar el recall de 0.64 a 0.96, lo que significa detectar casi todos los estudiantes en riesgo.',
      'Es fundamental recordar que estos modelos son herramientas de apoyo, no reemplazos del juicio humano en las decisiones de intervención.'] },

  { id: 'p10', n: 10, mod: 5, menu: 'Actividad: evalúa un modelo', title: 'Módulo 5 · Actividad', pose: 'normal', flags: ['gafas'], activity: true,
    bubble: 'Piensa como analista de datos.',
    guion: ['Esta actividad te presenta un caso realista. Piensa como un analista de datos que debe recomendar un modelo para una universidad colombiana.',
      'La clave está en entender que en deserción estudiantil, es más costoso no detectar a un estudiante en riesgo que intervenir en alguien que no lo necesitaba. Por eso, el recall es la métrica prioritaria.'] },

  { id: 'p11', n: 11, mod: 6, menu: 'Sistemas de Alerta Temprana (SAT)', title: 'Módulo 6: Sistemas de Alerta Temprana', pose: 'normal', flags: ['campana'],
    bubble: 'Predecir no basta: hay que actuar.',
    guion: ['Los Sistemas de Alerta Temprana representan la aplicación práctica de todo lo que hemos aprendido. Son herramientas que conectan los modelos predictivos con acciones concretas de retención estudiantil.',
      'Sin embargo, existe una brecha importante: la mayoría de las investigaciones se concentran en mejorar la precisión de los modelos, pero pocas evalúan si las intervenciones derivadas de esas predicciones realmente reducen la deserción.',
      'En Colombia, el SPADIES representa un avance significativo como sistema gubernamental de monitoreo, pero aún hay espacio para integrar técnicas avanzadas de ML en los SAT institucionales.'] },

  { id: 'p12', n: 12, mod: 6, menu: 'Actividad: diseña un SAT', title: 'Módulo 6 · Actividad', pose: 'arriba', flags: ['casco'], activity: true,
    bubble: '¡Construye tu propio SAT!',
    guion: ['En esta actividad diseñarás tu propio Sistema de Alerta Temprana. Arrastra los componentes en el orden correcto para construir el flujo completo de un SAT.',
      'Recuerda: un buen SAT no solo predice, sino que conecta esas predicciones con intervenciones concretas y mide su impacto.'] },

  { id: 'p13', n: 13, mod: 7, menu: 'Explicabilidad (XAI)', title: 'Módulo 7: Explicabilidad (XAI)', pose: 'lupa', flags: ['lupa'],
    bubble: '¿Por qué el modelo dice que hay riesgo? ¡Veamos!',
    guion: ['Imagina que un modelo predice que un estudiante tiene 85% de probabilidad de desertar. La pregunta natural es: ¿por qué? Las técnicas de Explicabilidad o XAI responden exactamente esta pregunta.',
      'SHAP, basado en la teoría de juegos, descompone cada predicción mostrando cuánto contribuye cada factor: tal vez el bajo GPA aporta 30 puntos de riesgo, la falta de asistencia otros 20, y la situación financiera 15 más.',
      'Solo el 24% de los estudios actuales utilizan estas técnicas, lo que representa una gran oportunidad para hacer los sistemas de alerta más transparentes y confiables.'] },

  { id: 'p14', n: 14, mod: 7, menu: 'Actividad: interpreta SHAP', title: 'Módulo 7 · Actividad', pose: 'lupa', flags: ['lupa'], activity: true,
    bubble: 'Fíjate en el color y la posición de los puntos.',
    guion: ['Ahora vas a interpretar un gráfico SHAP. Este tipo de visualización es fundamental para entender por qué un modelo clasifica a un estudiante como de alto o bajo riesgo.',
      'Observa cómo cada variable empuja la predicción hacia mayor o menor riesgo, y responde las preguntas basándote en el gráfico.'] },

  { id: 'p15', n: 15, mod: 8, menu: 'Casos en Latinoamérica', title: 'Módulo 8: Casos en Latinoamérica', pose: 'senala', flags: ['explorador'],
    bubble: '¡Exploremos casos de nuestra región!',
    guion: ['En este último módulo de contenido analizarás cómo se aplican los sistemas de predicción de deserción en el contexto latinoamericano.',
      'Latinoamérica tiene desafíos propios: los factores socioeconómicos pesan más que en otras regiones, la infraestructura tecnológica varía entre instituciones, y el primer año universitario concentra la mayor parte de la deserción.',
      'Colombia, con su sistema SPADIES, tiene una posición privilegiada para integrar técnicas de machine learning en la prevención de la deserción a nivel nacional.'] },

  { id: 'p16', n: 16, mod: 8, menu: 'Actividad integradora', title: 'Módulo 8 · Actividad integradora', pose: 'arriba', flags: [], activity: true,
    bubble: '¡Es tu turno de diseñar!',
    guion: ['Utilizando todo lo aprendido en los módulos anteriores, deberás diseñar una propuesta completa de sistema de alerta temprana para una universidad colombiana.',
      'No hay una única respuesta correcta. Lo importante es que justifiques cada decisión con evidencia de la investigación que hemos explorado a lo largo de este recorrido.'] },

  { id: 'p17', n: 17, mod: 9, menu: 'Evaluación final', title: 'Evaluación final', layout: 'big', pose: 'pulgar', flags: ['pulgar'],
    bubble: '¡Tú puedes! Confía en lo que aprendiste.',
    guion: ['Felicidades, has llegado a la evaluación final de todo el contenido. Es momento de que demuestres todo lo que has aprendido.',
      'La evaluación se va a dividir en dos partes: un cuestionario de conceptos clave y un caso aplicado donde deberás integrar todos los conocimientos del ODC. Necesitas obtener mínimo un 75% para aprobar.',
      'Tómate tu tiempo, recuerda las evidencias que exploramos y aplícalas. ¡Éxito!'] },

  { id: 'p18', n: 18, mod: 9, menu: 'Cierre y conclusiones', title: 'Cierre y conclusiones', layout: 'big', pose: 'saludo', flags: [],
    bubble: '¡Gracias por acompañarme! Hasta pronto.',
    guion: ['Hemos llegado al final de este camino, espero que hayas aprendido algo sobre los Sistemas de Alerta Temprana basados en Machine Learning para la educación superior.',
      'Recuerda: la tecnología es una herramienta poderosa, pero el verdadero impacto está en las personas que la utilizan para tomar mejores decisiones y apoyar a los estudiantes que más lo necesitan.',
      'Soy BRAI, fue un placer acompañarte en este camino de aprendizaje. ¡Hasta la próxima!'] },

  { id: 'p19', n: 19, mod: 9, menu: 'Créditos y licencia', title: 'Créditos y licencia', pose: 'normal', flags: [], noAudio: true,
    bubble: 'Este ODC fue creado con herramientas de código abierto.', guion: [] },

  { id: 'p20', n: 20, mod: 9, menu: 'Referencias (APA 7)', title: 'Referencias', pose: 'normal', flags: ['lupa'], noAudio: true,
    bubble: '30 artículos científicos respaldan este ODC.', guion: [] }
];

var MODULES = ['Introducción', 'La deserción', 'Fundamentos de ML', 'Variables', 'Modelos', 'SAT', 'XAI', 'Latinoamérica'];

var REFERENCIAS = [
'Al Hashmi, R. A. M., Zervopoulos, P. D., Elmehdi, H. M., & Ozturk, I. (2025). Predicting dropout in MENA STEM higher education using explainable AI: A machine learning approach. <i>Emerging Science Journal, 9</i>(Special Issue), 268–286. https://doi.org/10.28991/ESJ-2025-SIED1-016',
'Alvarado-Uribe, J., Mejía-Almada, P., Masetto Herrera, A. L., Molontay, R., Hilliger, I., Hegde, V., Montemayor Gallegos, J. E., Ramírez Díaz, R. A., & Ceballos, H. G. (2022). Student dataset from Tecnologico de Monterrey in Mexico to predict dropout in higher education. <i>Data, 7</i>(9), 119. https://doi.org/10.3390/data7090119',
'Alzabidi, E., Yakut, Ö., Saad, S., & Fındık, O. (2026). SOD-FE: A supervised outlier detection and feature engineering approach for student dropout prediction. <i>Scientific Reports, 16</i>(1). https://doi.org/10.1038/s41598-026-56591-6',
'Bettahi, A., Belouadha, F.-Z., & Harroud, H. (2025). A modular and explainable machine learning pipeline for student dropout prediction in higher education. <i>Algorithms, 18</i>(10), 662. https://doi.org/10.3390/a18100662',
'Briñez-De-León, J.-C., Patiño-Hoyos, A.-E., Restrepo-Loaiza, F.-A., & Cardona-Osorio, G.-J. (2025). A visual representation–based computational approach for student dropout analysis: A case study in Colombia. <i>Computation, 13</i>(12), 284. https://doi.org/10.3390/computation13120284',
'Cannistrà, M., Masci, C., Ieva, F., Agasisti, T., & Paganoni, A. M. (2022). Early-predicting dropout of university students: An application of innovative multilevel machine learning and statistical techniques. <i>Studies in Higher Education, 47</i>(9), 1935–1956. https://doi.org/10.1080/03075079.2021.2018415',
'Carballo-Mendívil, B., Arellano-González, A., Ríos-Vázquez, N. J., & Lizardi-Duarte, M. D. P. (2025). Predicting student dropout from day one: XGBoost-based early warning system using pre-enrollment data. <i>Applied Sciences, 15</i>(16), 9202. https://doi.org/10.3390/app15169202',
'Carballo-Mendívil, B., Pérez-Morales, A. J., Arellano-González, A., Lizardi-Duarte, M. D. P., & Ríos-Vázquez, N. J. (2026). Predicting student dropout from pre-enrollment data in Mexican higher education: A theoretically grounded and calibrated machine learning approach. <i>Education Sciences, 16</i>(8), 1216. https://doi.org/10.3390/educsci16081216',
'Cheng, Y.-H., & Lin, C.-E. (2026). Predicting university student dropout risk using deep learning and ensemble voting mechanism. <i>Engineering Proceedings, 120</i>(1), 66. https://doi.org/10.3390/engproc2025120066',
'Dermol, V., & Skrbinjek, V. (2026). Predicting student dropout in higher education using Random Forest and survival analysis. <i>Discover Education, 5</i>(1). https://doi.org/10.1007/s44217-026-01710-8',
'Dia, N. J., Sieras, J. C., Khalid, S. A., Macatotong, A. H. T., Mondejar, J. M., Genotiva, E. R., & Delena, R. D. (2025). EduGuard RetainX: An advanced analytical dashboard for predicting and improving student retention in tertiary education. <i>SoftwareX, 29</i>, 102057. https://doi.org/10.1016/j.softx.2025.102057',
'Elmasry, M. M. S., Gafar, M. G., & Elsabagh, M. A. (2026). Trustworthy educational risk modeling with calibrated probabilities, conformal uncertainty, explainable AI, and graph-based refinement. <i>Inventions, 11</i>(3), 65. https://doi.org/10.3390/inventions11030065',
'Esin, R. V., & Kustitskaya, T. A. (2026). Two-level monitoring system for preventing academic failure, based on predictive models and SHAP analysis. <i>Education Sciences, 16</i>(6), 842. https://doi.org/10.3390/educsci16060842',
'Hegde, V., Palaniswamy, A., Bhar, D., Revanna, M., Prakash, N., Prabhu, A., & Shanthappa, P. M. (2026). An explainable machine learning framework for early student dropout risk prediction and stratification. <i>Discover Artificial Intelligence, 6</i>(1). https://doi.org/10.1007/s44163-026-02288-8',
'Hidayat, N., Afuan, L., & Jannah, H. R. (2026). Prescriptive learning analytics for student dropout: Integrating temporal velocity and counterfactual explanations in longitudinal data. <i>Journal of Computing Theories and Applications, 3</i>(4), 627–646. https://doi.org/10.62411/jcta.15920',
'Hoyos Osorio, J. K., & Daza Santacoloma, G. (2023). Modelo predictivo para identificar estudiantes universitarios con alto grado de deserción. <i>Revista Electrónica de Investigación Educativa, 25</i>, e13. https://doi.org/10.24320/redie.2023.25.e13.5398',
'Kwon, J. B. (2026). A portable, generalizable machine learning framework for long-term student dropout prediction. <i>IEEE Access, 14</i>, 30830–30843. https://doi.org/10.1109/ACCESS.2026.3666870',
'Lázaro Alvarez, N., Callejas, Z., & Griol, D. (2020). Predicting computer engineering students\' dropout in Cuban higher education with pre-enrollment and early performance data. <i>Journal of Technology and Science Education, 10</i>(2), 241–258. https://doi.org/10.3926/jotse.922',
'Lopes, A. L., Rodrigues, D. M., Mauritti, R., Ferreira, M. R., & Pintassilgo, S. (2026). Securing equitable success in the first year: A whole-institution case study of data-driven early warning and critical AI literacy. <i>Education Sciences, 16</i>(9), 1451. https://doi.org/10.3390/educsci16091451',
'Lopez-Muñoz, G. L., Gonzalez Serrano, C., & Sanchez-Ferreira, C. (2026). Student dropout prediction in higher education: A systematic review of machine learning methods and risk factors. <i>Journal of Information Technology Education: Research, 25</i>, 1–28. https://doi.org/10.28945/5776',
'Nagy, M., & Molontay, R. (2024). Interpretable dropout prediction: Towards XAI-based personalized intervention. <i>International Journal of Artificial Intelligence in Education, 34</i>(2), 274–300. https://doi.org/10.1007/s40593-023-00331-8',
'Pacheco, E. J., & Pedroso, C. M. (2026). Interpretable undergraduate dropout prediction via explainable boosting and Gaussian hidden Markov models. <i>IEEE Access, 14</i>, 79029–79044. https://doi.org/10.1109/ACCESS.2026.3696589',
'Pecuchova, J., & Drlik, M. (2024). Enhancing the early student dropout prediction model through clustering analysis of students\' digital traces. <i>IEEE Access, 12</i>, 159336–159367. https://doi.org/10.1109/ACCESS.2024.3486762',
'Radulescu, D. A., & Balas, V. E. (2026). Explainable early warning systems for student dropout prediction: Insights from a bibliometric analysis. <i>International Journal of Computers, Communications and Control, 21</i>(4), 7599. https://doi.org/10.15837/ijccc.2026.4.7599',
'Sáiz-Manzanares, M. C., Marticorena-Sánchez, R., & García-Osorio, C. I. (2020). Monitoring students at the university: Design and application of a Moodle plugin. <i>Applied Sciences, 10</i>(10), 3469. https://doi.org/10.3390/app10103469',
'Silkhi, H., Bakkas, B., & Housni, K. (2025). Integrating cGAN-enhanced prediction with hybrid intervention recommendations systems for student dropout prevention. <i>International Journal of Advanced Computer Science and Applications, 16</i>(6), 986–995. https://doi.org/10.14569/IJACSA.2025.0160697',
'Taqatqeh, S., & Agoyi, M. (2026). Early warning and recommendation system for undergraduate students at higher education institutions based on machine learning methods. <i>PeerJ Computer Science, 12</i>, e3792. https://doi.org/10.7717/peerj-cs.3792',
'Vo, N. T., Le, Q. N., & Le, H. (2026). Artificial intelligence-driven early prediction of student dropout and academic outcomes in higher education: A comparative study of advanced machine learning approaches. <i>EAI Endorsed Transactions on Industrial Networks and Intelligent Systems, 13</i>(1), 1–10. https://doi.org/10.4108/eetinis.131.11758',
'Wijayanti, E., Widowati, & Widodo, C. E. (2026). Hybrid machine learning for early prediction of at-risk students with imbalanced data. <i>Journal of Applied Data Sciences, 7</i>(2), 1648–1660. https://doi.org/10.47738/jads.v7i2.1368',
'Yu, H., Zhao, S., & Zhang, Y. (2026). Cross-fitted multi-view neural risk augmentation for interpretable university dropout prediction. <i>Mathematics, 14</i>(17), 3147. https://doi.org/10.3390/math14173147'
];
