import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles for simple vendor format
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  daySection: {
    marginTop: 20,
    marginBottom: 15,
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottom: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingLeft: 10,
  },
  itemName: {
    fontSize: 11,
    flex: 1,
  },
  itemCount: {
    fontSize: 11,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    paddingLeft: 10,
    borderTop: 2,
    borderTopColor: '#000',
    fontWeight: 'bold',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
});

interface SimpleVendorOrderPDFProps {
  vendorName: string;
  weekStartDate: Date;
  weekEndDate: Date;
  itemCounts: Array<{
    dayOfWeek: string;
    itemName: string;
    count: number;
    users: string[];
  }>;
}

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const SimpleVendorOrderPDF: React.FC<SimpleVendorOrderPDFProps> = ({
  weekStartDate,
  weekEndDate,
  itemCounts,
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Group items by day and calculate totals
  const ordersByDay = DAYS_OF_WEEK.map((day) => {
    const dayItems = itemCounts.filter((ic) => ic.dayOfWeek === day);
    const dayTotal = dayItems.reduce((sum, item) => sum + item.count, 0);
    return {
      day,
      items: dayItems,
      total: dayTotal,
    };
  }).filter((dayData) => dayData.items.length > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>
          Orders for the week ({formatDate(weekStartDate)} - {formatDate(weekEndDate)})
        </Text>

        {/* Orders by Day */}
        {ordersByDay.map((dayData) => (
          <View key={dayData.day} style={styles.daySection}>
            <Text style={styles.dayHeader}>
              {dayData.day.charAt(0) + dayData.day.slice(1).toLowerCase()}:
            </Text>

            {dayData.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.itemName}</Text>
                <Text style={styles.itemCount}>{item.count}</Text>
              </View>
            ))}

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{dayData.total}</Text>
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>DevOps Africa Limited</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SimpleVendorOrderPDF;
