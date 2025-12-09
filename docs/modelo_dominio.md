\# Modelo de Dominio



\## Entidades Principales



\### Votante (Voter)

\- \*\*address\*\*: Dirección Ethereum única

\- \*\*isRegistered\*\*: Estado de registro

\- \*\*registrationTime\*\*: Fecha de registro

\- \*\*votedElections\*\*: Elecciones en las que ha participado



\### Elección (Election)

\- \*\*id\*\*: Identificador único

\- \*\*name\*\*: Nombre descriptivo

\- \*\*description\*\*: Detalles de la elección

\- \*\*options\*\*: Lista de opciones disponibles

\- \*\*startTime/endTime\*\*: Período de votación

\- \*\*status\*\*: Estado (Pendiente/Activa/Finalizada)



\### Voto (Vote)

\- \*\*electionId\*\*: Referencia a la elección

\- \*\*voterAddress\*\*: Dirección del votante

\- \*\*option\*\*: Opción seleccionada

\- \*\*timestamp\*\*: Momento del voto

\- \*\*txHash\*\*: Hash de la transacción

