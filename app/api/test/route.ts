/**
 * API Route de prueba para verificar la conexión a la base de datos.
 *
 * GET /api/test
 * Retorna el timestamp actual de la base de datos y el estado de la conexión.
 */

import { NextResponse } from 'next/server';
import { testConnection, executeQuery } from '@/lib/db';
import { createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * Handler GET - Prueba de conexión a la base de datos
 */
export async function GET() {
  try {
    // Verificar que DATABASE_URL esté configurada
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        createErrorResponse(
          ApiErrorCode.DATABASE_ERROR,
          'DATABASE_URL no está configurada. Por favor, configura la variable de entorno en .env.local'
        ),
        { status: 500 }
      );
    }

    // Intentar conectar y obtener timestamp
    const isConnected = await testConnection();

    if (!isConnected) {
      return NextResponse.json(
        createErrorResponse(
          ApiErrorCode.DATABASE_ERROR,
          'No se pudo establecer conexión con la base de datos'
        ),
        { status: 500 }
      );
    }

    // Obtener información adicional de la DB
    const result = await executeQuery<{
      now: string;
      version: string;
    }>('SELECT NOW() as now, version() as version');

    const dbInfo = result[0];

    return NextResponse.json(
      createSuccessResponse({
        status: 'connected',
        timestamp: dbInfo.now,
        database: 'PostgreSQL (Neon)',
        version: dbInfo.version.split(' ')[0] + ' ' + dbInfo.version.split(' ')[1], // Simplificar versión
        message: 'Conexión exitosa a la base de datos',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en /api/test:', error);

    return NextResponse.json(
      createErrorResponse(
        ApiErrorCode.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : 'Error desconocido al conectar con la base de datos'
      ),
      { status: 500 }
    );
  }
}
