/**
 * auditEvents.js — Lectura de eventos blockchain para auditoría pública.
 *
 * IMPORTANTE — PRIVACIDAD:
 * No exponemos `candidateId` ni la asociación votante → opción seleccionada.
 * La auditoría confirma que UNA transacción ocurrió, no QUÉ se votó.
 * El voter address es público en blockchain (no podemos ocultarlo), pero se
 * presenta truncado en la UI para legibilidad.
 */

import { getContract } from "./web3";
import { registryAbi } from "../abi/registry";
import { factoryAbi } from "../abi/factory";
import { electionAbi } from "../abi/election";

const MAX_BLOCKS_LOOKBACK = 50000; // ventana razonable para demo

/**
 * Devuelve eventos de bitácora ordenados por bloque descendente.
 * @returns Array<{type, txHash, blockNumber, timestamp, payload}>
 */
export async function fetchAuditLog(registryAddress, factoryAddress) {
  const events = [];

  try {
    const registry = await getContract(registryAddress, registryAbi);
    const factory = await getContract(factoryAddress, factoryAbi);
    const provider = registry.runner.provider;

    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - MAX_BLOCKS_LOOKBACK);

    // 1. Voter registrations
    const voterRegFilter = registry.filters.VoterRegistered();
    const voterRegEvents = await registry.queryFilter(voterRegFilter, fromBlock);
    for (const ev of voterRegEvents) {
      events.push({
        type: "voter_registered",
        txHash: ev.transactionHash,
        blockNumber: ev.blockNumber,
        contractAddress: registryAddress,
        payload: {
          voter: ev.args?.voter,
        },
      });
    }

    // 2. Election creations
    const electionCreatedFilter = factory.filters.ElectionCreated();
    const electionCreatedEvents = await factory.queryFilter(electionCreatedFilter, fromBlock);
    const electionAddresses = [];
    for (const ev of electionCreatedEvents) {
      events.push({
        type: "election_created",
        txHash: ev.transactionHash,
        blockNumber: ev.blockNumber,
        contractAddress: factoryAddress,
        payload: {
          electionAddress: ev.args?.electionAddress,
          electionName: ev.args?.name,
          startTime: Number(ev.args?.startTime),
          endTime: Number(ev.args?.endTime),
        },
      });
      electionAddresses.push({
        address: ev.args?.electionAddress,
        name: ev.args?.name,
      });
    }

    // 3. Votes (sin exponer candidateId)
    for (const { address, name } of electionAddresses) {
      try {
        const election = await getContract(address, electionAbi);

        // Single votes
        const voteCastFilter = election.filters.VoteCast();
        const voteCastEvents = await election.queryFilter(voteCastFilter, fromBlock);
        for (const ev of voteCastEvents) {
          events.push({
            type: "vote_cast",
            txHash: ev.transactionHash,
            blockNumber: ev.blockNumber,
            contractAddress: address,
            payload: {
              voter: ev.args?.voter,
              electionName: name,
              // ⚠️ candidateId omitido por privacidad
            },
          });
        }

        // Multiple votes
        const voteMultiFilter = election.filters.VoteMultipleCast();
        const voteMultiEvents = await election.queryFilter(voteMultiFilter, fromBlock);
        for (const ev of voteMultiEvents) {
          events.push({
            type: "vote_multiple",
            txHash: ev.transactionHash,
            blockNumber: ev.blockNumber,
            contractAddress: address,
            payload: {
              voter: ev.args?.voter,
              electionName: name,
              // ⚠️ candidateIds omitidos por privacidad
              choicesCount: ev.args?.candidateIds?.length || 0,
            },
          });
        }

        // Election closed
        const closedFilter = election.filters.ElectionClosed();
        const closedEvents = await election.queryFilter(closedFilter, fromBlock);
        for (const ev of closedEvents) {
          events.push({
            type: "election_closed",
            txHash: ev.transactionHash,
            blockNumber: ev.blockNumber,
            contractAddress: address,
            payload: {
              electionName: name,
              totalVotes: Number(ev.args?.totalVotes || 0),
            },
          });
        }
      } catch (err) {
        console.warn(`Error leyendo eventos de elección ${address}:`, err);
      }
    }

    // Obtener timestamps (solo para los bloques únicos involucrados)
    const uniqueBlocks = [...new Set(events.map((e) => e.blockNumber))];
    const blockTimestamps = {};
    await Promise.all(
      uniqueBlocks.map(async (bn) => {
        try {
          const block = await provider.getBlock(bn);
          blockTimestamps[bn] = Number(block.timestamp);
        } catch (err) {
          blockTimestamps[bn] = null;
        }
      })
    );
    events.forEach((e) => {
      e.timestamp = blockTimestamps[e.blockNumber];
    });

    // Ordenar por bloque descendente (más reciente primero)
    return events.sort((a, b) => {
      if (a.blockNumber !== b.blockNumber) return b.blockNumber - a.blockNumber;
      return 0;
    });
  } catch (err) {
    console.error("Error en fetchAuditLog:", err);
    return [];
  }
}

export const EVENT_LABELS = {
  voter_registered: { icon: "👤", label: "Votante registrado", color: "#0369a1" },
  election_created: { icon: "🗳️", label: "Elección creada", color: "#4338ca" },
  vote_cast: { icon: "✅", label: "Voto único emitido", color: "#10b981" },
  vote_multiple: { icon: "✅", label: "Voto múltiple emitido", color: "#10b981" },
  election_closed: { icon: "🔒", label: "Elección finalizada", color: "#6b7280" },
};
