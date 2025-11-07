// Cliente MySQL para fallback quando Supabase não está disponível

interface MySQLConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

const MYSQL_CONFIG: MySQLConfig = {
  host: 'localhost',
  port: 3306,
  database: 'ecomonitor',
  user: 'ecouser',
  password: 'ecopass123'
};

// Simulação de cliente MySQL (em produção usaria uma lib como mysql2)
class MySQLClient {
  private baseUrl: string;

  constructor() {
    // Em um ambiente real, isso seria uma conexão MySQL
    // Por agora, simula uma API REST que se conecta ao MySQL
    this.baseUrl = 'http://localhost:3001/api';
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.log('MySQL não disponível, usando dados locais');
      return false;
    }
  }

  async getMonitoringPoints(limit = 100) {
    try {
      const response = await fetch(`${this.baseUrl}/monitoring-points?limit=${limit}`);
      if (!response.ok) throw new Error('MySQL query failed');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar dados do MySQL:', error);
      throw error;
    }
  }

  async getAlerts(limit = 50) {
    try {
      const response = await fetch(`${this.baseUrl}/alerts?limit=${limit}`);
      if (!response.ok) throw new Error('MySQL query failed');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar alertas do MySQL:', error);
      throw error;
    }
  }

  async updateAlert(id: string | number, updateData: any) {
    try {
      const response = await fetch(`${this.baseUrl}/alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) throw new Error('MySQL update failed');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar alerta no MySQL:', error);
      throw error;
    }
  }
}

export const mysqlClient = new MySQLClient();