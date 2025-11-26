"use client"

import { EventValues } from '@/lib/validation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { PenBoxIcon, Trash2Icon, Cake, Loader2, Award } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { deleteEvent, generateBirthdayEvents, generateAnniversaryEvents } from '@/lib/actions/events.actions'
import EventAdd from './AddEvent'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Props {
    events: EventValues[]
}

const AllEvents = ({ events }: Props) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [generatingBirthdays, setGeneratingBirthdays] = useState(false)
    const [generatingAnniversaries, setGeneratingAnniversaries] = useState(false)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
    const [selectedAnniversaryYear, setSelectedAnniversaryYear] = useState(new Date().getFullYear().toString())
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isAnniversaryDialogOpen, setIsAnniversaryDialogOpen] = useState(false)
    const { toast } = useToast()

    // Generate year options (current year to 5 years in the future)
    const currentYear = new Date().getFullYear()
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear + i)

  const filteredRecords = events.filter(record =>{

      const monthName = record.start.toLocaleString('default', { month: 'long' }).toLowerCase(); // Full month name
      const monthNumber = (record.start.getMonth() + 1).toString(); // Numeric month (1-12)
      return (
            record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            monthName.includes(searchTerm.toLowerCase()) || // Match full month name
            monthNumber.includes(searchTerm.toLowerCase()) // Match month number
      )
  })


  const handleDelete =  async (id: string | undefined) => {
    if (!id) return
    const deleted = await deleteEvent(id)
    if (deleted.success) {
        toast({
            title: 'Deleted',
            description: "Successfully deleted event",
        })
    }else{
        toast({
            variant: 'destructive',
            title: 'Error',
            description: deleted.error,
        })
    }
  }

  const handleGenerateBirthdayEvents = async () => {
    setGeneratingBirthdays(true)
    try {
      const year = parseInt(selectedYear)
      const result = await generateBirthdayEvents(year)

      if (result.success) {
        toast({
          title: 'Success!',
          description: `Generated ${result.created} birthday events for ${result.year}. ${result.skipped! > 0 ? `Skipped ${result.skipped} existing events.` : ''}`,
        })
        setIsDialogOpen(false)
        // Reload the page to show new events
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to generate birthday events',
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      })
    } finally {
      setGeneratingBirthdays(false)
    }
  }

  const handleGenerateAnniversaryEvents = async () => {
    setGeneratingAnniversaries(true)
    try {
      const year = parseInt(selectedAnniversaryYear)
      const result = await generateAnniversaryEvents(year)

      if (result.success) {
        toast({
          title: 'Success!',
          description: `Generated ${result.created} work anniversary events for ${result.year}. ${result.skipped! > 0 ? `Skipped ${result.skipped} existing events.` : ''}`,
        })
        setIsAnniversaryDialogOpen(false)
        // Reload the page to show new events
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to generate work anniversary events',
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      })
    } finally {
      setGeneratingAnniversaries(false)
    }
  }

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
        <div className="mx-auto max-w-7xl lg:p-8 bg-white rounded-md shadow-sm">
        <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Events</CardTitle>
        <div className="flex gap-2">
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Cake className="h-4 w-4" />
                Generate Birthday Events
              </Button>
            </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Generate Birthday Events</AlertDialogTitle>
              <AlertDialogDescription>
                This will automatically create birthday events for all employees who have a date of birth set in their profile.
                Select the year for which you want to generate the events. Existing birthday events will be skipped.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4">
              <Label htmlFor="year-select" className="text-sm font-medium">
                Select Year
              </Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year-select" className="mt-2">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                      {year === currentYear && ' (Current Year)'}
                      {year === currentYear + 1 && ' (Next Year)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {parseInt(selectedYear) === currentYear
                  ? 'Generate events for the current year'
                  : `Generate events for ${selectedYear}`}
              </p>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={generatingBirthdays}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleGenerateBirthdayEvents} disabled={generatingBirthdays}>
                {generatingBirthdays ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating for {selectedYear}...
                  </>
                ) : (
                  `Generate Events for ${selectedYear}`
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isAnniversaryDialogOpen} onOpenChange={setIsAnniversaryDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Award className="h-4 w-4" />
              Generate Anniversary Events
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Generate Work Anniversary Events</AlertDialogTitle>
              <AlertDialogDescription>
                This will automatically create work anniversary events for all active employees who have a start date set in their profile.
                Select the year for which you want to generate the events. Existing anniversary events will be skipped.
                Note: Only anniversaries of 1 year or more will be created.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4">
              <Label htmlFor="anniversary-year-select" className="text-sm font-medium">
                Select Year
              </Label>
              <Select value={selectedAnniversaryYear} onValueChange={setSelectedAnniversaryYear}>
                <SelectTrigger id="anniversary-year-select" className="mt-2">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                      {year === currentYear && ' (Current Year)'}
                      {year === currentYear + 1 && ' (Next Year)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {parseInt(selectedAnniversaryYear) === currentYear
                  ? 'Generate events for the current year'
                  : `Generate events for ${selectedAnniversaryYear}`}
              </p>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={generatingAnniversaries}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleGenerateAnniversaryEvents} disabled={generatingAnniversaries}>
                {generatingAnniversaries ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating for {selectedAnniversaryYear}...
                  </>
                ) : (
                  `Generate Events for ${selectedAnniversaryYear}`
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Search by title or status or type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Start At</TableHead>
              <TableHead>End At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.type}</TableCell>
                <TableCell>{record.title}</TableCell>
                <TableCell>{record.location}</TableCell>
                <TableCell>{formatDateTime(record.start).dateOnly}</TableCell>
                <TableCell>{formatDateTime(record.end).dateOnly}</TableCell>
                <TableCell>
                    <Popover>
                        <PopoverTrigger asChild className='text-green-600'>
                            <Button asChild size='icon' className='bg-transparent hover:bg-green-600 cursor-pointer'>
                                <PenBoxIcon className="size-6 text-green-600 hover:text-white" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[30rem] flex justify-center items-center fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-md shadow-lg p-4 overflow-auto">
                            <EventAdd  event={record} update userId={record.userId} />
                        </PopoverContent>
                    </Popover>
                  <Button asChild size='icon' onClick={() => {
                    handleDelete(record.id)
                  }} className='bg-transparent hover:bg-red-600 cursor-pointer'>
                    <Trash2Icon className="size-6 text-red-600 hover:text-white" />
                  </Button>

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
        </div>
    </main>
  )
}

export default AllEvents
