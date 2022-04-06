import { Component, OnInit } from '@angular/core';
import { Billings } from './../../modules/wizards/models/billings.model';

@Component({
  selector: 'app-billings',
  templateUrl: './billings.component.html',
  styleUrls: ['./billings.component.scss']
})
export class BillingsComponent implements OnInit {

  public billingsData: Array<Billings> = [
    {
      transactionNo: '23456',
      date: '23-12-1999',
      paymentMethod: 'HBL',
      amount: '24567',
      status: 'Paid',
      currency: 'Euro'
    },
    {
      transactionNo: '23458',
      date: '23-12-2001',
      paymentMethod: 'Mezan',
      amount: '131537',
      status: 'Paid',
      currency: 'Euro'
    },
    {
      transactionNo: '23465',
      date: '23-12-2005',
      paymentMethod: 'Allied',
      amount: '74567',
      status: 'Paid',
      currency: 'Euro'
    },
    {
      transactionNo: '23461',
      date: '23-12-2010',
      paymentMethod: 'FedEx',
      amount: '234567',
      status: 'Paid',
      currency: 'Euro'
    },
    {
      transactionNo: '23470',
      date: '23-12-2015',
      paymentMethod: 'MCB',
      amount: '231345',
      status: 'Paid',
      currency: 'Euro'
    }
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
