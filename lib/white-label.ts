export interface WhiteLabelSettings {
  company_name: string | null;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  custom_domain: string | null;
  hide_powered_by: boolean;
  custom_footer_text: string | null;
}

export const DEFAULT_BRANDING: WhiteLabelSettings = {
  company_name: 'Aryanka',
  logo_url: null,
  primary_color: '#00D4FF',
  accent_color: '#3B82F6',
  custom_domain: null,
  hide_powered_by: false,
  custom_footer_text: null,
};
