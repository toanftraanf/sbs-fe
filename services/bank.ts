interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name: string;
  support: number;
  isTransfer: number;
  swift_code: string | null;
}

interface BankApiResponse {
  code: string;
  desc: string;
  data: Bank[];
}

class BankService {
  private baseUrl = 'https://api.vietqr.io/v2';

  async getAllBanks(): Promise<Bank[]> {
    try {
      const response = await fetch(`${this.baseUrl}/banks`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: BankApiResponse = await response.json();
      
      if (result.code !== '00') {
        throw new Error(result.desc || 'Failed to fetch banks');
      }
      
      // Filter only banks that support transfers for better UX
      return result.data.filter(bank => bank.isTransfer === 1);
    } catch (error) {
      console.error('Error fetching banks:', error);
      throw error;
    }
  }

  async getPopularBanks(): Promise<Bank[]> {
    const allBanks = await this.getAllBanks();
    
    // Return popular Vietnamese banks first
    const popularCodes = ['VCB', 'TCB', 'BIDV', 'ICB', 'MB', 'ACB', 'STB', 'TPB', 'VPB', 'VIB'];
    
    const popularBanks = popularCodes
      .map(code => allBanks.find(bank => bank.code === code))
      .filter((bank): bank is Bank => bank !== undefined);
    
    const otherBanks = allBanks.filter(bank => !popularCodes.includes(bank.code));
    
    return [...popularBanks, ...otherBanks];
  }
}

const bankService = new BankService();
export default bankService;
export type { Bank };

