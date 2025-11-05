import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#10A074',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10A074',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  dayHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    padding: 8,
    marginTop: 10,
    marginBottom: 8,
    color: '#1f2937',
  },
  itemContainer: {
    marginBottom: 12,
    paddingLeft: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingBottom: 3,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
  },
  itemCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10A074',
  },
  employeeList: {
    paddingLeft: 15,
    paddingTop: 5,
  },
  employeeName: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 9,
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  summaryBox: {
    backgroundColor: '#dcfce7',
    padding: 10,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 4,
  },
  summaryText: {
    fontSize: 11,
    color: '#166534',
    marginBottom: 3,
  },
});

interface OrderPDFProps {
  vendorName: string;
  weekStartDate: Date;
  weekEndDate: Date;
  selectionsByDay: Record<string, Array<{
    user: { name: string; department: string | null };
    menuItem: { itemName: string } | null;
  }>>;
  itemCounts: Array<{
    dayOfWeek: string;
    itemName: string;
    count: number;
    users: string[];
  }>;
  totalSelections: number;
  employeesWithSelections: number;
  actualMealOrders: number;
}

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const VendorOrderPDF: React.FC<OrderPDFProps> = ({
  vendorName,
  weekStartDate,
  weekEndDate,
  selectionsByDay,
  itemCounts,
  employeesWithSelections,
  actualMealOrders,
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{vendorName} - Weekly Food Orders</Text>
          <Text style={styles.subtitle}>
            Week: {formatDate(weekStartDate)} - {formatDate(weekEndDate)}
          </Text>
          <Text style={styles.subtitle}>
            Generated: {new Date().toLocaleString()}
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            Employees Ordered: {employeesWithSelections}
          </Text>
          <Text style={styles.summaryText}>
            Total Meals to Prepare: {actualMealOrders}
          </Text>
          <Text style={styles.summaryText}>
            Active Days: {DAYS_OF_WEEK.filter((day) => selectionsByDay[day]?.length > 0).length} of 5
          </Text>
        </View>

        {/* Orders by Day */}
        {DAYS_OF_WEEK.map((day) => {
          const dayItemCounts = itemCounts.filter((ic) => ic.dayOfWeek === day);

          if (dayItemCounts.length === 0) return null;

          return (
            <View key={day} style={styles.section}>
              <Text style={styles.dayHeader}>{day}</Text>

              {dayItemCounts.map((item, idx) => (
                <View key={idx} style={styles.itemContainer}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.itemName}</Text>
                    <Text style={styles.itemCount}>
                      {item.count} {item.count === 1 ? 'order' : 'orders'}
                    </Text>
                  </View>

                  <View style={styles.employeeList}>
                    {item.users.map((userName, userIdx) => (
                      <Text key={userIdx} style={styles.employeeName}>
                        • {userName}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>DevOps Africa Limited - Food Ordering System</Text>
          <Text>This document was generated automatically</Text>
        </View>
      </Page>
    </Document>
  );
};

export default VendorOrderPDF;
