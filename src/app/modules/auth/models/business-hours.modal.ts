export class BusinessHours {
  day:             string;
  firstStartTime:  string;
  firstEndTime:    string;
  secondStartTime: string;
  secondEndTime:   string;

  constructor(_businessHours: unknown) {
    const businessHours = _businessHours as BusinessHours;
    this.day = businessHours.day;
    this.firstStartTime = businessHours.firstStartTime;
    this.firstEndTime = businessHours.firstEndTime;
    this.secondStartTime = businessHours.secondStartTime;
    this.secondEndTime = businessHours.secondEndTime;
  }
}

export const initalBusinessHours =  [
  {
    "day": "MN",
    "firstStartTime": "",
    "firstEndTime": "",
    "secondStartTime": "",
    "secondEndTime": "",
    'isWorkingDay': true
  },
  {
    "day": "TU",
    "firstStartTime": "",
    "firstEndTime": "",
    "secondStartTime": "",
    "secondEndTime": "",
    'isWorkingDay': true
  },
  {
    "day": "WD",
    "firstStartTime": "",
    "firstEndTime": "",
    "secondStartTime": "",
    "secondEndTime": "",
    'isWorkingDay': true
  },
  {
    "day": "TH",
    "firstStartTime": "",
    "firstEndTime": "",
    "secondStartTime": "",
    "secondEndTime": "",
    'isWorkingDay': true
  },
  {
    "day": "FR",
    "firstStartTime": "",
    "firstEndTime": "",
    "secondStartTime": "",
    "secondEndTime": "",
    'isWorkingDay': true
  },
  {
    "day": "SA",
    "firstStartTime": "",
    "firstEndTime": "",
    "secondStartTime": "",
    "secondEndTime": "",
    'isWorkingDay': true
  },
  {
    "day": "SU",
    "firstStartTime": "",
    "firstEndTime": "",
    "secondStartTime": "",
    "secondEndTime": "",
    'isWorkingDay': true
  }
]
