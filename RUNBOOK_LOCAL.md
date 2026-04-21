# Runbook: Flujo Local End-to-End

Este documento es un paso-a-paso reproducible para levantar el sistema completo en localhost.

## Prerrequisitos

- Node.js 18+
- npm 8+
- MetaMask instalado en el navegador
- Directorio limpio (sin `node_modules` previos si tienes errores)

## Paso 1: Instalar dependencias

```bash
# Root
npm install

# Frontend
cd frontend
npm install
cd ..
```

## Paso 2: Iniciar el nodo local Hardhat

En una terminal dedicada:

```bash
npm run node
```

**Salida esperada:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

**No cierres esta terminal.** Permanece corriendo de fondo.

## Paso 3: Desplegar contratos (en otra terminal)

```bash
npm run deploy:localhost
```

**Salida esperada:**
```
✅ VoterRegistry: 0x5FbDB2315678afccb33d7d44Ca9a3a8b0B50362F
✅ ElectionFactory: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
📝 .env y frontend/.env actualizados automáticamente.
```

**Nota:** Las direcciones se guardan automáticamente en `.env` y `frontend/.env`.

## Paso 4: Semillar datos de prueba

En la misma terminal:

```bash
npm run seed:localhost
```

**Salida esperada:**
```
✅ Usando Registry existente: 0x5FbDB2315678afccb33d7d44Ca9a3a8b0B50362F
✅ Usando Factory existente: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
✅ Registrado: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (voter1)
✅ Registrado: 0x70997970C51812e339D9B73b0245ad59e6f7e59a (voter2)
✅ Elección demo creada: 0xDEAD...BEEF
```

## Paso 5: Iniciar el frontend

En una tercera terminal:

```bash
cd frontend
npm run dev
```

**Salida esperada:**
```
VITE v5.0.8 running at:

  ➜  Local:   http://localhost:3000/
```

Abre http://localhost:3000 en tu navegador.

## Paso 6: Conectar MetaMask

1. **Abre MetaMask** (extensión del navegador)
2. **Ve a "Configuración" → "Redes"**
3. **Busca "Hardhat Localhost"** (debe estar auto-agregado por el frontend)
4. **Si no existe, agrégalo manualmente:**
   - Nombre: `Hardhat Localhost`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Símbolo: `ETH`
5. **Selecciona la red "Hardhat Localhost"**
6. **En el frontend, haz clic en "Conectar MetaMask"**
7. **Aprueba la conexión en MetaMask**

**Cuenta por defecto (admin):**
- El primer signer de Hardhat (quien despliega los contratos)
- MetaMask auto-importa esta cuenta si usas la private key de Hardhat

## Paso 7: Flujo de demostración

El frontend debería mostrar:
- ✅ Wallet conectada
- ✅ "Votantes: 2" (los 2 de seed)

### Parte A: Registrar votante (admin only)

1. En MetaMask, **cambia a una cuenta diferente** (o copia una private key de Hardhat, ej. la 3ª)
2. En el frontend, **haz clic en "Conectar MetaMask"** para reconectar con nueva cuenta
3. Verás la sección "Registrar Votante" (solo si eres admin)
4. **Pega una address** (ej. la cuenta actual o la de otro test signer)
5. Haz clic en "Registrar"
6. **Aprueba en MetaMask**
7. Debería verse: "✅ Registrado" y el contador de votantes aumenta

### Parte B: Crear elección (admin only)

1. **Sigue siendo admin** (asegúrate de haber vuelto a la primera cuenta si cambiaste)
2. En la sección "Crear Elección", llena:
   - Nombre: ej. "Elección Test"
   - Descripción: ej. "Votación rápida"
   - Opciones: ej. "Opción 1, Opción 2, Opción 3"
   - Inicia en (minutos): `0` (comienza ya)
   - Duración (minutos): `60`
3. Haz clic en "Crear"
4. **Aprueba en MetaMask**
5. Debería verse: "✅ Elección creada"
6. Verás la nueva elección en "Elecciones"

### Parte C: Votar (cualquier votante registrado)

1. **Cambia a una cuenta votante registrada** (ej. voter1 o voter2 de seed):
   - Copia su private key de los logs del nodo
   - En MetaMask: "Importar cuenta" → pega private key
   - Selecciona esa cuenta
   - En el frontend, reconecta el wallet
2. Debería verse la elección bajo "Votar"
3. Selecciona una opción y haz clic en "Votar"
4. **Aprueba en MetaMask**
5. Debería verse: "✅ Voto registrado"
6. Los resultados actualizan en "Elecciones"

### Parte D: Ver resultados

En la sección "Elecciones" verás:
- Nombre, descripción, estado (Activa/Cerrada)
- Candidatos con contador de votos
- Total de votos

## Troubleshooting

### Error: "BAD_DATA isRegistered(address)"
- ❌ El `deploy` no corrió o falló silenciosamente
- ✅ Mira los logs de `npm run deploy:localhost`
- ✅ Verifica que `npm run node` sigue corriendo
- ✅ Vuelve a ejecutar `npm run deploy:localhost`

### Error: "MetaMask no puede conectar"
- ❌ El RPC (127.0.0.1:8545) no está disponible
- ✅ Verifica que `npm run node` sigue corriendo
- ✅ En MetaMask, verifica que el RPC URL es exacto: `http://127.0.0.1:8545`

### Error: "VITE_CONTRACT_REGISTRY_ADDRESS faltante"
- ❌ El `deploy:localhost` no guardó direcciones en `frontend/.env`
- ✅ Verifica que `npm run deploy:localhost` completó sin errores
- ✅ Mira manualmente `frontend/.env` — debe tener las direcciones
- ✅ Si está vacío, copia desde los logs de deploy:
  ```
  VITE_CONTRACT_REGISTRY_ADDRESS=0x...
  VITE_CONTRACT_FACTORY_ADDRESS=0x...
  VITE_NETWORK=localhost
  ```

### Error: "Already voted" al intentar votar de nuevo
- ✅ Esperado. Cada votante solo puede votar una vez por elección.
- Para probar de nuevo: cambia a otro votante registrado.

### MetaMask pide cambiar de red, pero falla
- ❌ La red localhost no está registrada en MetaMask
- ✅ Agrégala manualmente (ve Paso 6, punto 4)
- ✅ O simplemente aprueba la solicitud del frontend, que intentará agregarla

## Reiniciar desde cero

Si algo se rompe o quieres empezar limpio:

```bash
# Terminal del nodo (Ctrl+C para detener)
npm run node   # Levanta fresco, estado limpio

# Terminal de deploy (nueva)
npm run deploy:localhost
npm run seed:localhost

# Frontend debería reconectar automáticamente
```

Los datos del nodo local se pierden cuando lo reinicias (es un nodo efímero). Esto es **esperado y correcto** para desarrollo.

## Checklist de validación

Después de todo, verifica:

- [ ] Nodo Hardhat corriendo en 127.0.0.1:8545
- [ ] Contracts desplegados (sin errores en logs)
- [ ] Datos semillados (2 votantes registrados, 1 elección creada)
- [ ] Frontend carga sin "VITE_* missing" errors
- [ ] MetaMask conectado a Hardhat Localhost (chainId 31337)
- [ ] Se puede registrar votante (como admin)
- [ ] Se puede crear elección (como admin)
- [ ] Se puede votar (como votante registrado)
- [ ] Se ven resultados en tiempo real

Si todo ✅, **el flujo está stable y demo-ready.**

## Notas

- **Hardhat Localhost es efímero**: Cada restart borra todos los datos. Esto es correcto.
- **Private keys de Hardhat**: Los primeros 20 signers están disponibles automáticamente. Úsalos para pruebas.
- **Gas en localhost**: No hay cost reales. Las transacciones son gratis.
- **Timestamps**: Las elecciones se crean 2 min en el futuro (per seed.js) para dar tiempo de votación.
