// Base de conocimiento del asistente virtual.
// Controlada por el equipo — sin alucinaciones, contenido verificado.
// Estructurada en 3 ejes pedagógicos: uso, educación blockchain, contexto cívico.

export const chatbotKnowledge = {
  welcome: {
    title: "¡Hola! Soy tu asistente virtual",
    message:
      "Estoy aquí para ayudarte a entender y usar la plataforma de votación blockchain. Puedo explicarte cómo conectar tu wallet, qué hace blockchain por ti, y por qué este sistema es importante para la democracia digital.",
    suggestion: "¿Sobre qué te gustaría saber primero?",
  },

  categories: [
    {
      id: "usage",
      title: "Uso de la plataforma",
      icon: "🖱️",
      description: "Cómo usar la plataforma paso a paso",
      color: "#4f46e5",
      questions: [
        {
          id: "metamask-connect",
          q: "¿Cómo conecto mi billetera MetaMask?",
          a: `Para conectar tu billetera MetaMask sigue estos pasos:

**1. Instala MetaMask** (si aún no la tienes):
   - Ve a metamask.io
   - Instala la extensión en tu navegador
   - Crea una nueva cuenta o importa una existente

**2. Conecta tu wallet a la plataforma:**
   - En esta plataforma, haz clic en "Conectar Wallet"
   - MetaMask abrirá una ventana emergente
   - Selecciona la cuenta que deseas usar
   - Aprueba la conexión

**3. Verifica la red correcta:**
   - La plataforma usa Sepolia (red de pruebas) o localhost
   - MetaMask te pedirá cambiar de red si es necesario
   - Acepta el cambio

✅ Una vez conectada verás tu dirección truncada en la esquina superior (ej: 0x12...3456).`,
        },
        {
          id: "vote-not-registered",
          q: "¿Por qué mi voto no se registró?",
          a: `Hay varias razones por las que un voto puede no registrarse:

**1. No estás registrado como votante:**
   El administrador debe haber registrado tu dirección Ethereum previamente. Si no estás registrado, verás un mensaje "No autorizado".

**2. La elección no está activa:**
   - Si la elección aún no inicia → espera al horario de apertura
   - Si la elección ya cerró → tu voto no se aceptará

**3. Ya emitiste tu voto:**
   Solo puedes votar una vez por elección. El contrato bloquea votos duplicados automáticamente.

**4. Eres el administrador de la elección:**
   Por integridad democrática, el administrador NO puede votar en sus propias elecciones.

**5. Cancelaste la transacción en MetaMask:**
   Verifica que hayas aprobado la transacción cuando MetaMask te lo pidió.

💡 Si nada de lo anterior aplica, verifica tu conexión a internet y la red en MetaMask.`,
        },
        {
          id: "verify-vote",
          q: "¿Cómo sé que mi voto fue contado?",
          a: `Tu voto queda registrado de forma **pública y verificable** en blockchain:

**1. Confirmación visual:**
   Cuando votes, recibirás dos notificaciones:
   - ⏳ "Enviando voto..." con el hash de la transacción
   - ✅ "Voto registrado" cuando se confirma en blockchain

**2. Hash de transacción:**
   Cada voto genera un **hash único** (ej: 0xabc123...def). Este hash es la prueba criptográfica de que tu voto existe.

**3. Verificación pública:**
   Cualquier persona puede:
   - Consultar los resultados en tiempo real en la pestaña "Resultados"
   - Verificar el contrato directamente en un explorador blockchain (ej: Etherscan)
   - Validar que el conteo coincide con los votos emitidos

**4. Imposibilidad de alteración:**
   Una vez confirmado, tu voto **no puede ser borrado, modificado o duplicado**. Es inmutable por diseño.

🔐 Esto es lo que hace blockchain superior a sistemas tradicionales: confianza matemática, no humana.`,
        },
        {
          id: "ethereum-address",
          q: "¿Qué es una dirección Ethereum?",
          a: `Una **dirección Ethereum** es tu identidad única en la red blockchain.

**Características:**
- Es una cadena de 42 caracteres que empieza con "0x"
- Ejemplo: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1
- Es **única en todo el mundo** (probabilidad de colisión virtualmente cero)
- Funciona como una "dirección de correo" pero para blockchain

**¿Cómo se genera?**
Se deriva criptográficamente de tu clave privada (que MetaMask custodia). Nadie puede crear una dirección igual a la tuya sin tener tu clave.

**En esta plataforma:**
- Tu dirección Ethereum es tu **identidad de votante**
- El administrador la registra en el contrato para autorizarte
- Cada voto queda asociado a tu dirección (aunque tu identidad real permanece privada)

⚠️ **Importante:** Nunca compartas tu clave privada o frase secreta. La dirección sí es pública y segura de compartir.`,
        },
        {
          id: "admin-actions",
          q: "¿Qué puede hacer el administrador?",
          a: `El **administrador** es el rol con permisos elevados en la plataforma. Sus capacidades están limitadas por el smart contract:

**Puede hacer:**
✅ Registrar nuevas direcciones como votantes autorizados
✅ Crear nuevas elecciones (nombre, opciones, fechas, tipo)
✅ Ver métricas globales del sistema
✅ Consultar actividad reciente

**NO puede hacer:**
❌ **Votar en sus propias elecciones** (restricción del contrato)
❌ Modificar votos ya emitidos
❌ Borrar elecciones existentes
❌ Cambiar resultados
❌ Acceder a información privada de los votantes
❌ Manipular el orden de los candidatos durante la votación

**¿Por qué estas restricciones?**
El admin tiene poder operativo pero NO poder sobre los resultados. Esto garantiza:
- Separación de poderes (creador ≠ votante)
- Imposibilidad de fraude
- Confianza pública en el sistema

🛡️ El contrato es la "constitución" — ni siquiera el admin puede violarla.`,
        },
      ],
    },
    {
      id: "blockchain",
      title: "Educación blockchain",
      icon: "🔗",
      description: "Por qué blockchain es distinto",
      color: "#06b6d4",
      questions: [
        {
          id: "blockchain-vs-paper",
          q: "¿Por qué es más seguro votar en blockchain que en papel?",
          a: `Comparemos ambos sistemas en aspectos críticos:

**📜 Votación en papel:**
- Requiere confianza en las personas que cuentan los votos
- Los votos pueden perderse, alterarse o duplicarse
- El recuento es manual y propenso a errores
- La auditoría requiere recontar físicamente
- Centralizada en autoridades electorales

**⛓️ Votación en blockchain:**
- La confianza está en código matemático auditado, no en personas
- Los votos son **inmutables**: nadie puede modificarlos una vez emitidos
- El recuento es **automático y verificable en tiempo real**
- Cualquier persona puede auditar el código del contrato
- Descentralizada: validada por miles de nodos independientes

**Ventajas clave de blockchain:**

🔐 **Criptografía:** Cada voto está protegido matemáticamente.
👁️ **Transparencia:** Todo es público y verificable.
🚫 **No-duplicación:** Imposible votar dos veces por diseño.
⚡ **Resultados instantáneos:** Sin esperas de días.
📜 **Trazabilidad:** Historial completo y permanente.

⚠️ **Pero también hay desafíos:**
- Requiere acceso a internet y wallet digital
- La identidad debe verificarse fuera de blockchain
- Aún es una tecnología en evolución

La conclusión: blockchain elimina muchas vulnerabilidades clásicas, pero no es una bala de plata. Es una herramienta poderosa cuando se diseña bien.`,
        },
        {
          id: "immutability",
          q: "¿Qué significa que el voto sea inmutable?",
          a: `**Inmutabilidad** significa que una vez que tu voto se registra en blockchain, **nadie puede cambiarlo**. Ni el administrador, ni los desarrolladores, ni ningún hacker.

**¿Cómo funciona técnicamente?**

1. **Bloques encadenados:** Cada bloque de la blockchain contiene un "huella digital" criptográfica (hash) del bloque anterior.

2. **Si alguien modifica un voto antiguo:**
   - El hash del bloque cambiaría
   - Todos los bloques posteriores se invalidarían
   - Los miles de nodos de la red rechazarían el cambio

3. **Costo astronómico:**
   Modificar un voto requeriría:
   - Más poder computacional que toda la red combinada
   - Coordinación de miles de nodos independientes
   - Es **económicamente inviable** atacar la red

**¿Qué garantiza esto?**

✅ **Integridad del registro:** Lo que se votó, es lo que queda.
✅ **Auditoría histórica:** Puedes revisar votaciones de hace años.
✅ **Confianza distribuida:** No dependes de una autoridad central.
✅ **Resistencia a censura:** Nadie puede "borrar" votos incómodos.

**Ejemplo concreto:**
Si votas hoy por la "Opción A", dentro de 10 años cualquiera podrá verificar que ese voto existió y fue por la Opción A. Es imposible reescribir la historia.

🏛️ Esto es la base de la confianza en sistemas descentralizados.`,
        },
        {
          id: "double-vote-prevention",
          q: "¿Cómo garantiza la plataforma que nadie vote dos veces?",
          a: `La plataforma usa **múltiples capas de protección** para evitar el voto duplicado:

**Capa 1: Smart Contract (más importante)**

Cada elección mantiene un registro: \`mapping(address => bool) hasVoted\`

Cada vez que intentas votar, el contrato verifica:
\`\`\`solidity
require(!hasVoted[msg.sender], "Already voted");
\`\`\`

Si ya votaste, la transacción se **revierte automáticamente** y se cobra una pequeña tarifa (gas). Es matemáticamente imposible burlar esto.

**Capa 2: Registro de votantes**

Solo direcciones registradas por el admin pueden votar:
\`\`\`solidity
require(registry.isRegistered(msg.sender), "Not authorized");
\`\`\`

Esto previene que cuentas nuevas creadas espontáneamente voten.

**Capa 3: Restricción del admin**

El administrador NO puede votar en sus propias elecciones:
\`\`\`solidity
require(msg.sender != admin, "Admin cannot vote");
\`\`\`

**Capa 4: Validaciones de frontend**

La UI bloquea el botón de votar si:
- Ya votaste (oculta el formulario)
- Eres el admin de esa elección
- La elección no está activa

**¿Qué pasa si alguien lo intenta de todos modos?**

Si un usuario intenta enviar dos transacciones de voto:
1. La primera se confirma → \`hasVoted = true\`
2. La segunda se revierte → "Already voted"
3. Solo el primer voto cuenta, el segundo falla.

🛡️ **La defensa en profundidad asegura que el voto único es una garantía técnica, no una promesa.**`,
        },
        {
          id: "sepolia",
          q: "¿Qué es Sepolia y por qué se usa?",
          a: `**Sepolia** es una **red de pruebas** (testnet) de Ethereum. Es funcionalmente idéntica a la red principal (mainnet), pero usa "ETH de juguete" que no tiene valor real.

**¿Por qué usar una testnet?**

✅ **Pruebas sin riesgo:**
   - Desarrolladores pueden probar contratos sin gastar dinero real
   - Los usuarios pueden experimentar sin pérdidas

✅ **Costo cero:**
   - El ETH de Sepolia se obtiene gratis en "faucets" (grifos)
   - Cada transacción cuesta ETH testnet, no real

✅ **Idéntica a mainnet:**
   - Mismas reglas, mismo código, mismo comportamiento
   - Si funciona en Sepolia, funcionará en mainnet

✅ **Ideal para academia:**
   - Permite demostrar conceptos blockchain sin presupuesto
   - Estudiantes pueden experimentar libremente

**Esta plataforma soporta:**

🔧 **localhost** (Hardhat node)
   - Para desarrollo local en tu máquina
   - Transacciones instantáneas
   - 100% controlado por ti

🌐 **Sepolia** (testnet pública)
   - Para demos online y validación pública
   - Persistente y verificable
   - Cualquiera con la URL puede consultar resultados

**Otras testnets conocidas:**
- Goerli (deprecada)
- Holesky (nueva)
- Polygon Mumbai (cadena alternativa)

🎯 Sepolia es actualmente la testnet recomendada por la fundación Ethereum para desarrollo y pruebas.`,
        },
        {
          id: "what-is-smart-contract",
          q: "¿Qué es un smart contract?",
          a: `Un **smart contract** (contrato inteligente) es un **programa que vive en la blockchain**. Se ejecuta automáticamente según reglas predefinidas, sin intermediarios.

**Analogía simple:**
Una máquina expendedora:
- Insertas la moneda correcta → recibes el producto
- Sin importar quién seas, las reglas se aplican igual
- No necesitas confiar en un cajero

Un smart contract es igual, pero digital y para cualquier lógica imaginable.

**Características clave:**

⚡ **Autoejecución:** No requiere intervención humana
📜 **Inmutable:** Una vez desplegado, su código no cambia
🔍 **Transparente:** Cualquiera puede leer su código
🌐 **Descentralizado:** Vive en miles de nodos simultáneamente
💰 **Confiable:** No puede ser detenido por terceros

**En esta plataforma:**

📦 **VoterRegistry.sol:** Mantiene la lista de votantes autorizados.

🏭 **ElectionFactory.sol:** Despliega nuevas elecciones cuando el admin las crea.

🗳️ **Election.sol:** Cada elección es su propio contrato con:
   - Lista de candidatos
   - Ventana de tiempo
   - Reglas de votación
   - Conteo de votos

**¿Por qué importan?**

Antes de blockchain, para hacer una elección digital necesitabas:
- Servidor central confiable
- Base de datos protegida
- Auditorías constantes
- Confianza ciega en los operadores

Con smart contracts:
- El código es la ley
- No hay servidor que hackear
- No hay base de datos que alterar
- Confianza matemática, no humana

🧠 **Es una de las invenciones más disruptivas de los últimos 50 años en computación distribuida.**`,
        },
      ],
    },
    {
      id: "civic",
      title: "Importancia cívica",
      icon: "🏛️",
      description: "Por qué importa para la democracia",
      color: "#10b981",
      questions: [
        {
          id: "auditable-importance",
          q: "¿Por qué importa que el proceso sea auditable por cualquiera?",
          a: `La **auditoría pública** es uno de los pilares más importantes de la democracia digital.

**El problema histórico:**

En las elecciones tradicionales:
- Solo unos pocos pueden auditar el proceso
- Las auditorías requieren autorización legal
- Los datos son secretos hasta el escrutinio oficial
- La ciudadanía debe **confiar ciegamente** en las autoridades

**Esto crea vulnerabilidades:**
- Posible manipulación interna
- Errores no detectados
- Falta de transparencia
- Desconfianza pública

**La solución blockchain:**

Con votación en blockchain, **cualquier persona** puede:

🔍 **Inspeccionar el código:**
   El smart contract es público. Cualquier programador puede revisar si la lógica es justa.

📊 **Verificar el conteo:**
   Los votos son públicos (aunque anónimos). Puedes recontarlos tú mismo en tiempo real.

🕐 **Auditar el historial:**
   El registro completo de votos queda disponible para siempre.

🌍 **Validar globalmente:**
   No solo tu país: cualquier persona del mundo puede verificar.

**Impacto en la democracia:**

✅ **Confianza distribuida:** No dependemos de una autoridad central.
✅ **Resistencia a fraude:** El fraude requeriría comprometer miles de nodos.
✅ **Empoderamiento ciudadano:** Cada votante puede ser su propio auditor.
✅ **Transparencia radical:** El proceso es 100% verificable.

**Ejemplo de impacto real:**

Si hubiera dudas sobre los resultados:
- En sistema tradicional: requiere recuento físico oficial, costoso y lento
- En blockchain: cualquiera puede consultar y verificar **instantáneamente**

🏛️ **La auditabilidad pública convierte a cada ciudadano en un guardián del proceso democrático.**`,
        },
        {
          id: "vs-traditional",
          q: "¿Qué ventajas tiene frente a sistemas de votación electrónica tradicionales?",
          a: `Los sistemas electrónicos tradicionales (urnas electrónicas, software propietario, etc.) tienen problemas estructurales que blockchain resuelve.

**Comparación directa:**

**🖥️ Sistema electrónico tradicional:**
- Software propietario y cerrado
- Auditoría limitada a entidades autorizadas
- Servidor central (punto único de falla)
- Base de datos modificable por administradores
- Resultados pueden ser "ajustados" técnicamente
- Difícil detectar manipulaciones a tiempo

**⛓️ Sistema blockchain (este):**
- Código abierto y verificable
- Auditoría disponible para cualquiera
- Descentralizado (múltiples nodos validan)
- Datos inmutables por diseño criptográfico
- Resultados matemáticamente verificables
- Manipulación detectable inmediatamente

**Casos famosos de problemas con sistemas tradicionales:**

⚠️ Diversos países han reportado:
   - Fallas en máquinas que cuentan votos incorrectamente
   - Software con backdoors no documentados
   - Imposibilidad de recontar manualmente
   - Discrepancias entre votos emitidos y contados

**Lo que NO resuelve blockchain (siendo honestos):**

❌ **Identidad real del votante:**
   Blockchain confirma que una dirección votó, pero la asociación dirección↔persona requiere otro sistema (KYC, biometría, etc.)

❌ **Acceso digital:**
   No todos tienen wallet o conocimiento blockchain

❌ **Suplantación:**
   Si alguien roba tu wallet, puede votar por ti

**¿Cuándo es mejor blockchain?**

✅ Elecciones donde la **transparencia** es prioritaria
✅ Procesos donde la **inmutabilidad** es crítica
✅ Contextos donde la **descentralización** importa
✅ Comunidades con **alfabetización digital**

❌ Elecciones donde el **acceso universal** sin tecnología es prioritario
❌ Sistemas que requieren **anonimato absoluto** (blockchain es pseudo-anónimo)

🎯 **Conclusión:** Blockchain no reemplaza todo, pero supera ampliamente a sistemas electrónicos tradicionales en confianza, transparencia y auditabilidad.`,
        },
        {
          id: "admin-manipulation",
          q: "¿Puede el administrador manipular los resultados?",
          a: `**No.** El administrador tiene poder operativo pero **NO tiene poder sobre los resultados**. Esta es una decisión arquitectónica crítica.

**Lo que el admin SÍ controla:**

✅ Quién puede votar (registro de direcciones)
✅ Cuándo abre/cierra una elección (fechas)
✅ Qué opciones aparecen (candidatos)
✅ Tipo de votación (única o múltiple)

**Lo que el admin NO controla:**

❌ **Modificar votos ya emitidos**
   Una vez que un voto se confirma en blockchain, es inmutable. Ni siquiera el admin puede tocarlo.

❌ **Cambiar resultados**
   El conteo lo hace automáticamente el smart contract. No hay función para "ajustar" votos.

❌ **Votar en sus propias elecciones**
   El contrato lo bloquea explícitamente:
   \`\`\`
   require(msg.sender != admin, "Admin cannot vote");
   \`\`\`

❌ **Borrar elecciones**
   Las elecciones quedan permanentemente registradas.

❌ **Inflar votos**
   Cada voto requiere una dirección registrada Y una transacción firmada. No se pueden inventar.

**¿Cómo puedo verificarlo yo mismo?**

1. **Revisa el código del contrato:**
   El archivo \`Election.sol\` es público. Puedes auditarlo línea por línea.

2. **Verifica las transacciones:**
   Cada voto deja un registro permanente con hash. Cuéntalos manualmente.

3. **Consulta la blockchain:**
   En testnets como Sepolia, usa Etherscan para validar las transacciones.

**Pero, ¿qué pasaría si el admin intentara hacer trampa?**

Hipótesis: El admin quiere agregar votos falsos para su candidato favorito.

Realidad:
- Necesitaría direcciones registradas (que él mismo registró)
- Cada dirección solo puede votar una vez
- Cada transacción debe ser firmada con la clave privada de esa dirección
- Sería **inmediatamente detectable** por cualquier auditor

**El verdadero poder del admin:**

El admin puede decidir **quién participa** (registro), pero no **cómo se cuentan los votos**. Esto es análogo a:
- Un organizador de elecciones decide quién es elector
- Pero NO decide qué votó cada elector

🛡️ **La integridad del resultado es responsabilidad del código, no de la persona.**

📜 Esta separación de poderes es lo que hace al sistema **éticamente defendible**.`,
        },
        {
          id: "global-impact",
          q: "¿Cómo cambia esto el futuro de la democracia digital?",
          a: `La votación blockchain representa un **salto generacional** en cómo entendemos los procesos democráticos.

**Las implicaciones son profundas:**

**🌍 Democracia global:**
   Comunidades distribuidas (ONGs internacionales, DAOs, cooperativas globales) pueden tomar decisiones sin necesidad de un país sede.

**🏛️ Reducción de costos:**
   Las elecciones tradicionales cuestan millones. Blockchain reduce costos operativos drásticamente.

**📈 Mayor participación:**
   Personas pueden votar desde cualquier lugar con internet, no solo presencialmente.

**🛡️ Resistencia a regímenes autoritarios:**
   En lugares donde las autoridades manipulan elecciones, blockchain ofrece una alternativa que no pueden controlar.

**📊 Decisiones más frecuentes:**
   Si votar es barato y rápido, podemos consultar más temas (democracia directa, no solo representativa).

**Casos reales en el mundo:**

🇪🇸 **Cataluña** ha experimentado con votación blockchain para consultas internas.
🇪🇪 **Estonia** lleva años con sistemas digitales avanzados (no blockchain pero similar).
🌐 **DAOs (Decentralized Autonomous Organizations)** ya usan blockchain para gobernanza desde 2016.
🇸🇮 **Eslovenia** ha pilotado proyectos académicos similares.

**Lo que aún falta resolver:**

🔐 **Identidad digital robusta:**
   Necesitamos vincular wallets a personas reales de forma confiable y privada.

📚 **Educación masiva:**
   La población general necesita entender blockchain para confiar en él.

⚖️ **Marcos legales:**
   Los códigos electorales deben adaptarse a esta nueva tecnología.

📱 **Accesibilidad universal:**
   Wallets más simples para personas sin conocimientos técnicos.

**Esta plataforma como contribución:**

Este proyecto académico aporta:

✅ Una **prueba de concepto funcional** y operativa
✅ Código **abierto y auditable** para investigación
✅ Una **arquitectura modular** adaptable a distintos contextos
✅ **Documentación clara** para futuros desarrolladores
✅ Un punto de partida para **discusión académica seria**

🚀 **Más que código:** este es un paso hacia un futuro donde la confianza se construye con matemáticas, no con burocracia.

🏛️ La democracia merece las mejores herramientas disponibles. Blockchain es una de ellas.`,
        },
      ],
    },
  ],
};

export const tutorialSteps = [
  {
    target: "header",
    title: "Bienvenido al Sistema",
    message:
      "Esta es una plataforma de votación descentralizada sobre Ethereum. Te guiaré rápidamente por las funciones principales.",
  },
  {
    target: "nav-tabs",
    title: "Navegación",
    message:
      "Tienes 4 secciones: Inicio (resumen), Panel Admin (solo administradores), Votar (emitir tu voto), y Resultados (consultar conteos).",
  },
  {
    target: "wallet",
    title: "Tu identidad blockchain",
    message:
      "Esa dirección 0x... es tu identidad única en la red. El admin debe registrarla para que puedas votar.",
  },
];
