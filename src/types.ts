export interface Order {
  id: string;
  date: string;
  name: string;
  phoneNumber: string;
  size: string;
  color: string;
  design: string;
  designPosition: 'Front' | 'Back';
  location: string;
  note: string;
  apparelType: 'T-shirt' | 'Hoodie';
}
