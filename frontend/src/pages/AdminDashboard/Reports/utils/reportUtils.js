import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDF = async (content, fileName) => {
  try {
    const canvas = await html2canvas(content, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      windowWidth: content.scrollWidth,
      windowHeight: content.scrollHeight
    });
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(
      canvas.toDataURL('image/jpeg', 1.0),
      'JPEG',
      0,
      0,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    );

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};

// Common summary calculations
export const calculateOrderSummary = (orders = []) => ({
  totalOrders: orders.length,
  totalAmount: orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
  averageOrderValue: orders.length ? 
    orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0) / orders.length : 0
});

// Common date formatting
export const formatDate = (date) => new Date(date).toLocaleDateString();

// Common status badge styling
export const getStatusBadgeVariant = (status) => {
  const variants = {
    'In Stock': 'success',
    'Out of Stock': 'danger',
    'Low Stock': 'warning',
    'Pending': 'info',
    'Completed': 'success',
    'Cancelled': 'danger'
  };
  return variants[status] || 'secondary';
}; 