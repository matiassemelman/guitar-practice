/**
 * Cliente de base de datos para PostgreSQL (Neon).
 *
 * Proporciona funciones helper para conectar y ejecutar queries
 * usando @neondatabase/serverless sin ORM.
 */

import { neon } from '@neondatabase/serverless';

/**
 * Obtiene la URL de conexión a la base de datos desde las variables de entorno.
 * @throws {Error} Si DATABASE_URL no está configurada
 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      'DATABASE_URL no está configurada. Por favor, configura la variable de entorno en .env.local'
    );
  }

  return url;
}

/**
 * Crea un cliente de base de datos conectado.
 * @returns Cliente SQL de Neon listo para ejecutar queries
 */
export function getDbClient() {
  const url = getDatabaseUrl();
  return neon(url);
}

/**
 * Ejecuta una query SQL con parámetros.
 * Usa el método .query() de Neon para queries con placeholders ($1, $2, etc.).
 *
 * @param sql - Query SQL con placeholders ($1, $2, etc.)
 * @param params - Array de valores para los placeholders
 * @returns Resultado de la query
 * @throws {Error} Si la query falla o hay un error de conexión
 */
export async function executeQuery<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  try {
    const client = getDbClient();

    // Ejecutar query con Neon usando el método .query()
    // El driver de Neon requiere usar .query() para strings dinámicos
    const result = await (client as any).query(sql, params);

    return result as T[];
  } catch (error) {
    // Log del error para debugging (en producción usar logger apropiado)
    console.error('Error ejecutando query:', {
      error,
      sql: sql.substring(0, 100), // Primeros 100 caracteres para debugging
    });

    // Re-lanzar con mensaje más descriptivo
    if (error instanceof Error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    throw new Error('Database query failed: Unknown error');
  }
}

/**
 * Ejecuta una query que debe retornar exactamente una fila.
 *
 * @param sql - Query SQL con placeholders opcionales
 * @param params - Parámetros para los placeholders
 * @returns La primera fila del resultado
 * @throws {Error} Si no se encuentra ninguna fila
 */
export async function executeQueryOne<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T> {
  const results = await executeQuery<T>(sql, params);

  if (results.length === 0) {
    throw new Error('No se encontró ningún registro');
  }

  return results[0];
}

/**
 * Ejecuta una query que puede retornar una fila o null.
 *
 * @param sql - Query SQL con placeholders opcionales
 * @param params - Parámetros para los placeholders
 * @returns La primera fila del resultado o null si no hay resultados
 */
export async function executeQueryOneOrNull<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const results = await executeQuery<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Verifica la conexión a la base de datos.
 *
 * @returns true si la conexión es exitosa
 * @throws {Error} Si la conexión falla
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await executeQuery<{ now: string }>('SELECT NOW() as now');
    return result.length > 0 && !!result[0].now;
  } catch (error) {
    console.error('Test de conexión falló:', error);
    throw error;
  }
}

/**
 * Obtiene el número total de filas en una tabla.
 * Útil para estadísticas y paginación.
 *
 * @param tableName - Nombre de la tabla
 * @param whereClause - Cláusula WHERE opcional (sin la palabra WHERE)
 * @param params - Parámetros para la cláusula WHERE
 * @returns Número total de filas
 */
export async function getRowCount(
  tableName: string,
  whereClause?: string,
  params: unknown[] = []
): Promise<number> {
  let sql = `SELECT COUNT(*) as count FROM ${tableName}`;

  if (whereClause) {
    sql += ` WHERE ${whereClause}`;
  }

  const result = await executeQueryOne<{ count: string }>(sql, params);
  return parseInt(result.count, 10);
}
