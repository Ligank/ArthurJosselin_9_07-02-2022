import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
    switch (file.type) {
      case 'image/JPG':
      case 'image/PNG':
      case 'image/JPEG':
      case 'image/jpg':
      case 'image/png':
      case 'image/jpeg':
        break;
      default:
        alert('Le fichier doit être un .JPG, un .PNG ou un .JPEG.');
        document.querySelector(`input[data-testid="file"]`).value = '';
    }
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]
    const formData = new FormData()
    if (!JSON.parse(localStorage.getItem("user"))) {
      const email = "employee@test.tld"
      formData.append('file', file)
      formData.append('email', email)
    } else {
      const email = JSON.parse(localStorage.getItem("user")).email
      formData.append('file', file)
      formData.append('email', email)
    }
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error)) 
  }
  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    let email;
    if (!JSON.parse(localStorage.getItem("user"))) {
      email = "employee@test.tld"
    } else {
      email = JSON.parse(localStorage.getItem("user")).email
    }
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}