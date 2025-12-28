export interface CountryCode {
  code: string;
  minLength: number;
  maxLength: number;
  name: string;
}

export const countryCodes: CountryCode[] = [
  { code: '+1', minLength: 10, maxLength: 10, name: 'United States' },
  { code: '+1', minLength: 10, maxLength: 10, name: 'Canada' },
  { code: '+7', minLength: 10, maxLength: 10, name: 'Russia' },
  { code: '+20', minLength: 10, maxLength: 10, name: 'Egypt' },
  { code: '+27', minLength: 9, maxLength: 9, name: 'South Africa' },
  { code: '+30', minLength: 10, maxLength: 10, name: 'Greece' },
  { code: '+31', minLength: 9, maxLength: 9, name: 'Netherlands' },
  { code: '+32', minLength: 9, maxLength: 9, name: 'Belgium' },
  { code: '+33', minLength: 9, maxLength: 9, name: 'France' },
  { code: '+34', minLength: 9, maxLength: 9, name: 'Spain' },
  { code: '+39', minLength: 10, maxLength: 10, name: 'Italy' },
  { code: '+40', minLength: 10, maxLength: 10, name: 'Romania' },
  { code: '+41', minLength: 9, maxLength: 9, name: 'Switzerland' },
  { code: '+43', minLength: 10, maxLength: 13, name: 'Austria' },
  { code: '+44', minLength: 10, maxLength: 11, name: 'United Kingdom' },
  { code: '+45', minLength: 8, maxLength: 8, name: 'Denmark' },
  { code: '+46', minLength: 9, maxLength: 9, name: 'Sweden' },
  { code: '+47', minLength: 8, maxLength: 8, name: 'Norway' },
  { code: '+48', minLength: 9, maxLength: 9, name: 'Poland' },
  { code: '+49', minLength: 10, maxLength: 11, name: 'Germany' },
  { code: '+51', minLength: 9, maxLength: 9, name: 'Peru' },
  { code: '+52', minLength: 10, maxLength: 10, name: 'Mexico' },
  { code: '+53', minLength: 8, maxLength: 8, name: 'Cuba' },
  { code: '+54', minLength: 10, maxLength: 11, name: 'Argentina' },
  { code: '+55', minLength: 10, maxLength: 11, name: 'Brazil' },
  { code: '+56', minLength: 9, maxLength: 9, name: 'Chile' },
  { code: '+57', minLength: 10, maxLength: 10, name: 'Colombia' },
  { code: '+58', minLength: 10, maxLength: 10, name: 'Venezuela' },
  { code: '+60', minLength: 9, maxLength: 10, name: 'Malaysia' },
  { code: '+61', minLength: 9, maxLength: 9, name: 'Australia' },
  { code: '+62', minLength: 10, maxLength: 12, name: 'Indonesia' },
  { code: '+63', minLength: 10, maxLength: 10, name: 'Philippines' },
  { code: '+64', minLength: 9, maxLength: 10, name: 'New Zealand' },
  { code: '+65', minLength: 8, maxLength: 8, name: 'Singapore' },
  { code: '+66', minLength: 9, maxLength: 9, name: 'Thailand' },
  { code: '+81', minLength: 10, maxLength: 10, name: 'Japan' },
  { code: '+82', minLength: 9, maxLength: 10, name: 'South Korea' },
  { code: '+84', minLength: 9, maxLength: 10, name: 'Vietnam' },
  { code: '+86', minLength: 11, maxLength: 11, name: 'China' },
  { code: '+90', minLength: 10, maxLength: 10, name: 'Turkey' },
  { code: '+91', minLength: 10, maxLength: 10, name: 'India' },
  { code: '+92', minLength: 10, maxLength: 10, name: 'Pakistan' },
  { code: '+93', minLength: 9, maxLength: 9, name: 'Afghanistan' },
  { code: '+94', minLength: 9, maxLength: 9, name: 'Sri Lanka' },
  { code: '+95', minLength: 9, maxLength: 10, name: 'Myanmar' },
  { code: '+98', minLength: 10, maxLength: 10, name: 'Iran' },
  { code: '+212', minLength: 9, maxLength: 9, name: 'Morocco' },
  { code: '+213', minLength: 9, maxLength: 9, name: 'Algeria' },
  { code: '+216', minLength: 8, maxLength: 8, name: 'Tunisia' },
  { code: '+218', minLength: 9, maxLength: 10, name: 'Libya' },
  { code: '+220', minLength: 7, maxLength: 7, name: 'Gambia' },
  { code: '+221', minLength: 9, maxLength: 9, name: 'Senegal' },
  { code: '+222', minLength: 8, maxLength: 8, name: 'Mauritania' },
  { code: '+223', minLength: 8, maxLength: 8, name: 'Mali' },
  { code: '+224', minLength: 9, maxLength: 9, name: 'Guinea' },
  { code: '+225', minLength: 10, maxLength: 10, name: 'Ivory Coast' },
  { code: '+226', minLength: 8, maxLength: 8, name: 'Burkina Faso' },
  { code: '+227', minLength: 8, maxLength: 8, name: 'Niger' },
  { code: '+228', minLength: 8, maxLength: 8, name: 'Togo' },
  { code: '+229', minLength: 8, maxLength: 8, name: 'Benin' },
  { code: '+230', minLength: 8, maxLength: 8, name: 'Mauritius' },
  { code: '+231', minLength: 8, maxLength: 9, name: 'Liberia' },
  { code: '+234', minLength: 10, maxLength: 10, name: 'Nigeria' },
  { code: '+235', minLength: 8, maxLength: 8, name: 'Chad' },
  { code: '+236', minLength: 8, maxLength: 8, name: 'Central African Republic' },
  { code: '+237', minLength: 9, maxLength: 9, name: 'Cameroon' },
  { code: '+238', minLength: 7, maxLength: 7, name: 'Cape Verde' },
  { code: '+239', minLength: 7, maxLength: 7, name: 'Sao Tome and Principe' },
  { code: '+240', minLength: 9, maxLength: 9, name: 'Equatorial Guinea' },
  { code: '+241', minLength: 7, maxLength: 8, name: 'Gabon' },
  { code: '+242', minLength: 9, maxLength: 9, name: 'Republic of Congo' },
  { code: '+243', minLength: 9, maxLength: 9, name: 'Democratic Republic of Congo' },
  { code: '+244', minLength: 9, maxLength: 9, name: 'Angola' },
  { code: '+245', minLength: 7, maxLength: 7, name: 'Guinea-Bissau' },
  { code: '+246', minLength: 7, maxLength: 7, name: 'British Indian Ocean Territory' },
  { code: '+248', minLength: 7, maxLength: 7, name: 'Seychelles' },
  { code: '+249', minLength: 9, maxLength: 9, name: 'Sudan' },
  { code: '+250', minLength: 9, maxLength: 9, name: 'Rwanda' },
  { code: '+251', minLength: 9, maxLength: 9, name: 'Ethiopia' },
  { code: '+252', minLength: 8, maxLength: 9, name: 'Somalia' },
  { code: '+253', minLength: 8, maxLength: 8, name: 'Djibouti' },
  { code: '+254', minLength: 9, maxLength: 10, name: 'Kenya' },
  { code: '+255', minLength: 9, maxLength: 9, name: 'Tanzania' },
  { code: '+256', minLength: 9, maxLength: 9, name: 'Uganda' },
  { code: '+257', minLength: 8, maxLength: 8, name: 'Burundi' },
  { code: '+258', minLength: 9, maxLength: 9, name: 'Mozambique' },
  { code: '+260', minLength: 9, maxLength: 9, name: 'Zambia' },
  { code: '+261', minLength: 9, maxLength: 9, name: 'Madagascar' },
  { code: '+262', minLength: 9, maxLength: 9, name: 'Reunion' },
  { code: '+263', minLength: 9, maxLength: 9, name: 'Zimbabwe' },
  { code: '+264', minLength: 9, maxLength: 10, name: 'Namibia' },
  { code: '+265', minLength: 9, maxLength: 9, name: 'Malawi' },
  { code: '+266', minLength: 8, maxLength: 8, name: 'Lesotho' },
  { code: '+267', minLength: 8, maxLength: 8, name: 'Botswana' },
  { code: '+268', minLength: 8, maxLength: 8, name: 'Eswatini' },
  { code: '+269', minLength: 7, maxLength: 7, name: 'Comoros' },
  { code: '+290', minLength: 4, maxLength: 4, name: 'Saint Helena' },
  { code: '+291', minLength: 7, maxLength: 7, name: 'Eritrea' },
  { code: '+297', minLength: 7, maxLength: 7, name: 'Aruba' },
  { code: '+298', minLength: 6, maxLength: 6, name: 'Faroe Islands' },
  { code: '+299', minLength: 6, maxLength: 6, name: 'Greenland' },
  { code: '+350', minLength: 8, maxLength: 8, name: 'Gibraltar' },
  { code: '+351', minLength: 9, maxLength: 9, name: 'Portugal' },
  { code: '+352', minLength: 9, maxLength: 9, name: 'Luxembourg' },
  { code: '+353', minLength: 9, maxLength: 9, name: 'Ireland' },
  { code: '+354', minLength: 7, maxLength: 7, name: 'Iceland' },
  { code: '+355', minLength: 9, maxLength: 9, name: 'Albania' },
  { code: '+356', minLength: 8, maxLength: 8, name: 'Malta' },
  { code: '+357', minLength: 8, maxLength: 8, name: 'Cyprus' },
  { code: '+358', minLength: 9, maxLength: 10, name: 'Finland' },
  { code: '+359', minLength: 9, maxLength: 9, name: 'Bulgaria' },
  { code: '+370', minLength: 8, maxLength: 8, name: 'Lithuania' },
  { code: '+371', minLength: 8, maxLength: 8, name: 'Latvia' },
  { code: '+372', minLength: 7, maxLength: 8, name: 'Estonia' },
  { code: '+373', minLength: 8, maxLength: 8, name: 'Moldova' },
  { code: '+374', minLength: 8, maxLength: 8, name: 'Armenia' },
  { code: '+375', minLength: 9, maxLength: 9, name: 'Belarus' },
  { code: '+376', minLength: 6, maxLength: 6, name: 'Andorra' },
  { code: '+377', minLength: 8, maxLength: 9, name: 'Monaco' },
  { code: '+378', minLength: 10, maxLength: 10, name: 'San Marino' },
  { code: '+380', minLength: 9, maxLength: 9, name: 'Ukraine' },
  { code: '+381', minLength: 9, maxLength: 9, name: 'Serbia' },
  { code: '+382', minLength: 8, maxLength: 8, name: 'Montenegro' },
  { code: '+383', minLength: 8, maxLength: 8, name: 'Kosovo' },
  { code: '+385', minLength: 9, maxLength: 9, name: 'Croatia' },
  { code: '+386', minLength: 8, maxLength: 8, name: 'Slovenia' },
  { code: '+387', minLength: 8, maxLength: 8, name: 'Bosnia and Herzegovina' },
  { code: '+389', minLength: 8, maxLength: 8, name: 'North Macedonia' },
  { code: '+420', minLength: 9, maxLength: 9, name: 'Czech Republic' },
  { code: '+421', minLength: 9, maxLength: 9, name: 'Slovakia' },
  { code: '+423', minLength: 7, maxLength: 7, name: 'Liechtenstein' },
  { code: '+500', minLength: 5, maxLength: 5, name: 'Falkland Islands' },
  { code: '+501', minLength: 7, maxLength: 7, name: 'Belize' },
  { code: '+502', minLength: 8, maxLength: 8, name: 'Guatemala' },
  { code: '+503', minLength: 8, maxLength: 8, name: 'El Salvador' },
  { code: '+504', minLength: 8, maxLength: 8, name: 'Honduras' },
  { code: '+505', minLength: 8, maxLength: 8, name: 'Nicaragua' },
  { code: '+506', minLength: 8, maxLength: 8, name: 'Costa Rica' },
  { code: '+507', minLength: 8, maxLength: 8, name: 'Panama' },
  { code: '+508', minLength: 6, maxLength: 6, name: 'Saint Pierre and Miquelon' },
  { code: '+509', minLength: 8, maxLength: 8, name: 'Haiti' },
  { code: '+590', minLength: 9, maxLength: 9, name: 'Guadeloupe' },
  { code: '+591', minLength: 8, maxLength: 8, name: 'Bolivia' },
  { code: '+592', minLength: 7, maxLength: 7, name: 'Guyana' },
  { code: '+593', minLength: 9, maxLength: 9, name: 'Ecuador' },
  { code: '+594', minLength: 9, maxLength: 9, name: 'French Guiana' },
  { code: '+595', minLength: 9, maxLength: 9, name: 'Paraguay' },
  { code: '+596', minLength: 9, maxLength: 9, name: 'Martinique' },
  { code: '+597', minLength: 7, maxLength: 7, name: 'Suriname' },
  { code: '+598', minLength: 8, maxLength: 8, name: 'Uruguay' },
  { code: '+599', minLength: 7, maxLength: 7, name: 'Curacao' },
  { code: '+670', minLength: 7, maxLength: 8, name: 'East Timor' },
  { code: '+672', minLength: 6, maxLength: 6, name: 'Antarctica' },
  { code: '+673', minLength: 7, maxLength: 7, name: 'Brunei' },
  { code: '+674', minLength: 7, maxLength: 7, name: 'Nauru' },
  { code: '+675', minLength: 8, maxLength: 8, name: 'Papua New Guinea' },
  { code: '+676', minLength: 5, maxLength: 7, name: 'Tonga' },
  { code: '+677', minLength: 7, maxLength: 7, name: 'Solomon Islands' },
  { code: '+678', minLength: 7, maxLength: 7, name: 'Vanuatu' },
  { code: '+679', minLength: 7, maxLength: 7, name: 'Fiji' },
  { code: '+680', minLength: 7, maxLength: 7, name: 'Palau' },
  { code: '+681', minLength: 6, maxLength: 6, name: 'Wallis and Futuna' },
  { code: '+682', minLength: 5, maxLength: 5, name: 'Cook Islands' },
  { code: '+683', minLength: 4, maxLength: 4, name: 'Niue' },
  { code: '+685', minLength: 7, maxLength: 7, name: 'Samoa' },
  { code: '+686', minLength: 8, maxLength: 8, name: 'Kiribati' },
  { code: '+687', minLength: 6, maxLength: 6, name: 'New Caledonia' },
  { code: '+688', minLength: 6, maxLength: 6, name: 'Tuvalu' },
  { code: '+689', minLength: 8, maxLength: 8, name: 'French Polynesia' },
  { code: '+690', minLength: 4, maxLength: 4, name: 'Tokelau' },
  { code: '+691', minLength: 7, maxLength: 7, name: 'Micronesia' },
  { code: '+692', minLength: 7, maxLength: 7, name: 'Marshall Islands' },
  { code: '+850', minLength: 10, maxLength: 10, name: 'North Korea' },
  { code: '+852', minLength: 8, maxLength: 8, name: 'Hong Kong' },
  { code: '+853', minLength: 8, maxLength: 8, name: 'Macau' },
  { code: '+855', minLength: 9, maxLength: 9, name: 'Cambodia' },
  { code: '+856', minLength: 9, maxLength: 10, name: 'Laos' },
  { code: '+880', minLength: 10, maxLength: 10, name: 'Bangladesh' },
  { code: '+886', minLength: 9, maxLength: 9, name: 'Taiwan' },
  { code: '+960', minLength: 7, maxLength: 7, name: 'Maldives' },
  { code: '+961', minLength: 8, maxLength: 8, name: 'Lebanon' },
  { code: '+962', minLength: 9, maxLength: 9, name: 'Jordan' },
  { code: '+963', minLength: 9, maxLength: 9, name: 'Syria' },
  { code: '+964', minLength: 10, maxLength: 10, name: 'Iraq' },
  { code: '+965', minLength: 8, maxLength: 8, name: 'Kuwait' },
  { code: '+966', minLength: 9, maxLength: 9, name: 'Saudi Arabia' },
  { code: '+967', minLength: 9, maxLength: 9, name: 'Yemen' },
  { code: '+968', minLength: 8, maxLength: 8, name: 'Oman' },
  { code: '+970', minLength: 9, maxLength: 9, name: 'Palestine' },
  { code: '+971', minLength: 9, maxLength: 9, name: 'United Arab Emirates' },
  { code: '+972', minLength: 9, maxLength: 9, name: 'Israel' },
  { code: '+973', minLength: 8, maxLength: 8, name: 'Bahrain' },
  { code: '+974', minLength: 8, maxLength: 8, name: 'Qatar' },
  { code: '+975', minLength: 8, maxLength: 8, name: 'Bhutan' },
  { code: '+976', minLength: 8, maxLength: 8, name: 'Mongolia' },
  { code: '+977', minLength: 10, maxLength: 10, name: 'Nepal' },
  { code: '+992', minLength: 9, maxLength: 9, name: 'Tajikistan' },
  { code: '+993', minLength: 8, maxLength: 8, name: 'Turkmenistan' },
  { code: '+994', minLength: 9, maxLength: 9, name: 'Azerbaijan' },
  { code: '+995', minLength: 9, maxLength: 9, name: 'Georgia' },
  { code: '+996', minLength: 9, maxLength: 9, name: 'Kyrgyzstan' },
  { code: '+998', minLength: 9, maxLength: 9, name: 'Uzbekistan' },
].sort((a, b) => a.name.localeCompare(b.name));

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false };
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g., example@domain.com)'
    };
  }

  const parts = email.split('@');
  if (parts[0].length < 1) {
    return {
      isValid: false,
      error: 'Email must have at least one character before @'
    };
  }

  if (parts[1].length < 3) {
    return {
      isValid: false,
      error: 'Domain name is too short'
    };
  }

  return { isValid: true };
};

export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) {
    return { isValid: false };
  }

  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  if (!/^[\+\d]+$/.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Phone number can only contain digits, +, spaces, hyphens, and parentheses'
    };
  }

  const matchedCountry = countryCodes.find(country => cleanPhone.startsWith(country.code));

  if (!matchedCountry) {
    return {
      isValid: false,
      error: 'Please start with a valid country code (e.g., +91 for India, +1 for US)'
    };
  }

  const numberWithoutCode = cleanPhone.substring(matchedCountry.code.length);
  const digitCount = numberWithoutCode.length;

  if (digitCount < matchedCountry.minLength) {
    return {
      isValid: false,
      error: `Phone number for ${matchedCountry.name} must be at least ${matchedCountry.minLength} digits (currently ${digitCount})`
    };
  }

  if (digitCount > matchedCountry.maxLength) {
    return {
      isValid: false,
      error: `Phone number for ${matchedCountry.name} must be at most ${matchedCountry.maxLength} digits (currently ${digitCount})`
    };
  }

  return { isValid: true };
};

export const validateAadhaar = (aadhaar: string): { isValid: boolean; error?: string } => {
  if (!aadhaar) {
    return { isValid: false };
  }

  const cleanAadhaar = aadhaar.replace(/[\s\-]/g, '');

  if (!/^\d+$/.test(cleanAadhaar)) {
    return {
      isValid: false,
      error: 'Aadhaar number must contain only digits'
    };
  }

  if (cleanAadhaar.length < 12) {
    return {
      isValid: false,
      error: `Aadhaar number must be exactly 12 digits (currently ${cleanAadhaar.length})`
    };
  }

  if (cleanAadhaar.length > 12) {
    return {
      isValid: false,
      error: `Aadhaar number must be exactly 12 digits (currently ${cleanAadhaar.length})`
    };
  }

  return { isValid: true };
};

export const isAadhaarField = (label: string): boolean => {
  const normalizedLabel = label.toLowerCase();
  return normalizedLabel.includes('aadhaar') ||
         normalizedLabel.includes('aadhar') ||
         normalizedLabel.includes('uid');
};

export const isPhoneField = (fieldType: string, label: string): boolean => {
  const normalizedLabel = label.toLowerCase();
  return fieldType === 'phone' ||
         fieldType === 'tel' ||
         normalizedLabel.includes('phone') ||
         normalizedLabel.includes('mobile') ||
         normalizedLabel.includes('contact');
};

export const isEmailField = (fieldType: string, label: string): boolean => {
  const normalizedLabel = label.toLowerCase();
  return fieldType === 'email' ||
         normalizedLabel.includes('email') ||
         normalizedLabel.includes('e-mail');
};
