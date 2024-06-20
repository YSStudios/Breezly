import jsPDF from 'jspdf';
import 'jspdf-autotable';

const generatePDF = (formData) => {
  const doc = new jsPDF();

  doc.text('Form Data', 20, 20);

  const tableColumn = ["Field", "Value"];
  const tableRows = [];

  for (const key in formData) {
    const rowData = [
      key,
      formData[key]
    ];
    tableRows.push(rowData);
  }

  doc.autoTable(tableColumn, tableRows, { startY: 30 });

  doc.save('form-data.pdf');
};

export default generatePDF;
