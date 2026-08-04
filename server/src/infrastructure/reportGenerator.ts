import PDFDocument from 'pdfkit';
import { prisma } from './prisma';

export async function generatePdfReport(reportType: string): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header Banner
      doc.rect(0, 0, 595.28, 60).fill('#0f172a'); // Dark slate header
      doc.fillColor('#ffffff').fontSize(20).text('ENTERPRISE GRC PLATFORM REPORT', 40, 20, { align: 'left' });
      doc.fontSize(10).text(`Generated on ${new Date().toLocaleString()}`, 40, 42, { align: 'left' });
      doc.moveDown(3);

      doc.fillColor('#0f172a').fontSize(16).text(`Report Type: ${reportType.toUpperCase()}`, 40, 80);
      doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, 105).lineTo(555, 105).stroke();

      if (reportType === 'risk' || reportType === 'executive') {
        const risks = await prisma.risk.findMany({ take: 20 });
        doc.moveDown(1);
        doc.fontSize(12).text('Risk Register Summary (Top 20 Items)', 40, 120);
        doc.moveDown(0.5);

        let y = 140;
        doc.fontSize(9).fillColor('#475569');
        doc.text('ID', 40, y);
        doc.text('Title', 100, y);
        doc.text('Score', 380, y);
        doc.text('Status', 440, y);
        doc.text('Category', 490, y);
        y += 15;
        doc.strokeColor('#e2e8f0').moveTo(40, y).lineTo(555, y).stroke();
        y += 5;

        for (const r of risks) {
          if (y > 750) {
            doc.addPage();
            y = 40;
          }
          doc.fillColor('#1e293b');
          doc.text(r.riskId, 40, y);
          doc.text(r.title.substring(0, 45), 100, y);
          doc.text(`${r.score}/25`, 380, y);
          doc.text(r.status, 440, y);
          doc.text(r.category.substring(0, 12), 490, y);
          y += 18;
        }
      } else if (reportType === 'asset') {
        const assets = await prisma.asset.findMany({ take: 25, include: { assignedEmployee: true } });
        let y = 120;
        doc.fontSize(12).fillColor('#0f172a').text('Enterprise Asset Inventory Report', 40, y);
        y += 20;

        for (const a of assets) {
          if (y > 750) {
            doc.addPage();
            y = 40;
          }
          doc.fontSize(9).fillColor('#1e293b');
          const emp = a.assignedEmployee ? `${a.assignedEmployee.firstName} ${a.assignedEmployee.lastName}` : 'Unassigned';
          doc.text(`${a.assetTag} | ${a.name} | Cat: ${a.category} | Status: ${a.status} | Assigned: ${emp}`, 40, y);
          y += 16;
        }
      } else {
        const employees = await prisma.employee.findMany({ take: 25 });
        let y = 120;
        doc.fontSize(12).fillColor('#0f172a').text('Employee Governance Directory', 40, y);
        y += 20;

        for (const e of employees) {
          if (y > 750) {
            doc.addPage();
            y = 40;
          }
          doc.fontSize(9).fillColor('#1e293b');
          doc.text(`${e.employeeCode} - ${e.firstName} ${e.lastName} | Dept: ${e.department} | ${e.designation} | Risk: ${e.riskScore}/100`, 40, y);
          y += 16;
        }
      }

      // Footer
      doc.fontSize(8).fillColor('#94a3b8').text('Confidential - Internal Enterprise Governance Use Only', 40, 800, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function generateCsvReport(reportType: string): Promise<string> {
  if (reportType === 'asset') {
    const assets = await prisma.asset.findMany({ take: 500, include: { assignedEmployee: true } });
    const header = 'AssetTag,Name,Category,SerialNumber,Status,RiskScore,ComplianceStatus,AssignedEmployee\n';
    const rows = assets
      .map(
        (a) =>
          `"${a.assetTag}","${a.name}","${a.category}","${a.serialNumber}","${a.status}",${a.riskScore},"${a.complianceStatus}","${a.assignedEmployee ? a.assignedEmployee.email : ''}"`
      )
      .join('\n');
    return header + rows;
  }

  if (reportType === 'risk') {
    const risks = await prisma.risk.findMany({ take: 500 });
    const header = 'RiskID,Title,Category,Likelihood,Impact,Score,Status,Owner\n';
    const rows = risks
      .map((r) => `"${r.riskId}","${r.title}","${r.category}",${r.likelihood},${r.impact},${r.score},"${r.status}","${r.owner}"`)
      .join('\n');
    return header + rows;
  }

  const employees = await prisma.employee.findMany({ take: 500 });
  const header = 'EmployeeCode,FirstName,LastName,Email,Department,Designation,OfficeLocation,RiskScore\n';
  const rows = employees
    .map((e) => `"${e.employeeCode}","${e.firstName}","${e.lastName}","${e.email}","${e.department}","${e.designation}","${e.officeLocation}",${e.riskScore}`)
    .join('\n');
  return header + rows;
}
