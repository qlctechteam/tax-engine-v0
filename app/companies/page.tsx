"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useApp } from "@/providers/app-provider"
import { groupCompaniesByLetter, type Company } from "@/lib/data"
import {
  Search,
  X,
  Plus,
  FileUp,
  Building2,
  ChevronRight,
  User,
  Mail,
  Phone,
  AlertCircle,
  Check,
  Loader2,
} from "lucide-react"

export default function CompaniesPage() {
  const router = useRouter()
  const { clientList, addClient, bulkAddClients } = useApp()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
  const grouped = useMemo(() => groupCompaniesByLetter(clientList), [clientList])

  // New Client Dialog State
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [companyNumber, setCompanyNumber] = useState("")
  const [utr, setUtr] = useState("")
  const [payeReference, setPayeReference] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [companySearchResults, setCompanySearchResults] = useState<{ name: string; number: string }[]>([])
  const [showCompanyResults, setShowCompanyResults] = useState(false)
  const [selectedFromSearch, setSelectedFromSearch] = useState(false)

  // CSV Upload State
  const [csvUploadOpen, setCsvUploadOpen] = useState(false)
  const [csvData, setCsvData] = useState<Company[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // Filter clients based on search and selected letter
  const filteredClients = useMemo(() => {
    let results = clientList

    // Filter by search query first (primary)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.number.toLowerCase().includes(query)
      )
    }
    // Then filter by letter if selected (secondary)
    else if (selectedLetter) {
      results = grouped[selectedLetter] || []
    }

    return results.sort((a, b) => a.name.localeCompare(b.name))
  }, [clientList, searchQuery, selectedLetter, grouped])

  const handleClientClick = (client: Company) => {
    router.push(`/companies/${client.id}`)
  }

  // Simulated Companies House API search
  const searchCompaniesHouse = async (query: string) => {
    if (query.length < 3) {
      setCompanySearchResults([])
      setShowCompanyResults(false)
      return
    }
    setIsSearching(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    const mockResults = [
      { name: query.toUpperCase() + " LTD", number: String(Math.floor(10000000 + Math.random() * 90000000)) },
      { name: query.toUpperCase() + " LIMITED", number: String(Math.floor(10000000 + Math.random() * 90000000)) },
      { name: query.toUpperCase() + " HOLDINGS LTD", number: String(Math.floor(10000000 + Math.random() * 90000000)) },
    ]
    setCompanySearchResults(mockResults)
    setShowCompanyResults(true)
    setIsSearching(false)
  }

  const handleSelectCompanyFromSearch = (result: { name: string; number: string }) => {
    setCompanyName(result.name)
    setCompanyNumber(result.number)
    setSelectedFromSearch(true)
    setShowCompanyResults(false)
  }

  const handleCreateClient = () => {
    if (!companyName || !companyNumber || !utr || !contactName || !contactEmail || !contactPhone) return
    
    const newClient: Company = {
      id: `c${Date.now()}`,
      name: companyName,
      number: companyNumber,
      utr,
      payeReference: payeReference || undefined,
      contactName,
      contactEmail,
      contactPhone,
    }
    
    addClient(newClient)
    resetNewClientForm()
    setNewClientOpen(false)
  }

  const resetNewClientForm = () => {
    setCompanyName("")
    setCompanyNumber("")
    setUtr("")
    setPayeReference("")
    setContactName("")
    setContactEmail("")
    setContactPhone("")
    setSelectedFromSearch(false)
    setCompanySearchResults([])
    setShowCompanyResults(false)
  }

  // CSV Parsing
  const parseCSV = (content: string) => {
    const lines = content.split("\n").filter((line) => line.trim())
    const errors: string[] = []
    const clients: Company[] = []
    
    const headers = lines[0]?.toLowerCase().split(",").map((h) => h.trim())
    
    if (!headers || headers.length < 6) {
      errors.push("CSV must have headers: Company Name, Company Number, UTR, PAYE Reference, Contact Name, Contact Email, Contact Phone")
      setCsvErrors(errors)
      return
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
      
      if (values.length < 6) {
        errors.push(`Row ${i + 1}: Insufficient fields`)
        continue
      }

      const [name, number, utrVal, payeRef, cName, cEmail, cPhone] = values

      if (!name || !number || !utrVal || !cName || !cEmail || !cPhone) {
        errors.push(`Row ${i + 1}: Missing required fields`)
        continue
      }

      clients.push({
        id: `c${Date.now()}-${i}`,
        name,
        number,
        utr: utrVal,
        payeReference: payeRef || undefined,
        contactName: cName,
        contactEmail: cEmail,
        contactPhone: cPhone,
      })
    }

    setCsvData(clients)
    setCsvErrors(errors)
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      parseCSV(content)
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === "text/csv") {
      handleFileUpload(file)
    } else {
      setCsvErrors(["Please upload a valid CSV file"])
    }
  }

  const handleBulkImport = () => {
    if (csvData.length > 0) {
      bulkAddClients(csvData)
      setCsvData([])
      setCsvErrors([])
      setCsvUploadOpen(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 mx-auto container">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Clients</h1>
        <div className="flex gap-2">
          {/* CSV Upload Dialog */}
          <Dialog open={csvUploadOpen} onOpenChange={setCsvUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileUp className="h-4 w-4 mr-2" />
                CSV Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Bulk Import Clients</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to import multiple clients at once.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    isDragging ? "border-primary bg-primary/5" : "border-border",
                    "hover:border-primary/50"
                  )}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <FileUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium text-foreground mb-1">Drop your CSV file here</p>
                  <p className="text-sm text-muted-foreground mb-3">or click to browse</p>
                  <Input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    id="csv-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      Browse Files
                    </label>
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Required CSV format:</p>
                  <p className="font-mono bg-muted p-2 rounded text-xs overflow-x-auto">
                    Company Name, Company Number, UTR, PAYE Reference, Contact Name, Contact Email, Contact Phone
                  </p>
                </div>

                {csvErrors.length > 0 && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                    <div className="flex items-center gap-2 text-destructive mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium text-sm">Import Errors</span>
                    </div>
                    <ul className="text-xs text-destructive space-y-1">
                      {csvErrors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {csvErrors.length > 5 && (
                        <li>...and {csvErrors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}

                {csvData.length > 0 && (
                  <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <Check className="h-4 w-4" />
                      <span className="font-medium text-sm">{csvData.length} clients ready to import</span>
                    </div>
                    <ScrollArea className="h-32">
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {csvData.map((client, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Building2 className="h-3 w-3" />
                            {client.name} ({client.number})
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setCsvData([])
                  setCsvErrors([])
                  setCsvUploadOpen(false)
                }}>
                  Cancel
                </Button>
                <Button onClick={handleBulkImport} disabled={csvData.length === 0}>
                  Import {csvData.length} Clients
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* New Client Dialog */}
          <Dialog open={newClientOpen} onOpenChange={(open) => {
            setNewClientOpen(open)
            if (!open) resetNewClientForm()
          }}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="group h-9 px-4 text-sm tracking-tight text-primary-foreground font-semibold rounded-lg border-t border-t-white/20 border-b-2 border-b-black/15 border-x border-x-white/10 bg-gradient-to-b from-primary/90 to-primary animate-cta-breathe hover:from-primary/80 hover:to-primary hover:shadow-[0_4px_0_0_rgba(0,0,0,0.15),0_6px_12px_-2px_rgba(0,0,0,0.3),0_12px_24px_-4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.2),0_0_24px_-4px_var(--primary)] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.25),0_2px_4px_-2px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-[transform,background] duration-150"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Search Companies House to find and add a new client.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name *</Label>
                  <div className="relative">
                    <Input
                      id="company-name"
                      placeholder="Start typing to search Companies House..."
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value)
                        setSelectedFromSearch(false)
                        searchCompaniesHouse(e.target.value)
                      }}
                      onFocus={() => companySearchResults.length > 0 && setShowCompanyResults(true)}
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {showCompanyResults && companySearchResults.length > 0 && (
                      <Card className="absolute top-12 left-0 right-0 z-50 overflow-hidden">
                        <ScrollArea className="max-h-48">
                          {companySearchResults.map((result, i) => (
                            <button
                              key={i}
                              onClick={() => handleSelectCompanyFromSearch(result)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-muted text-left border-b border-border last:border-0"
                            >
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium text-sm">{result.name}</div>
                                <div className="text-xs text-muted-foreground">{result.number}</div>
                              </div>
                            </button>
                          ))}
                        </ScrollArea>
                      </Card>
                    )}
                  </div>
                  {selectedFromSearch && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Selected from Companies House
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-number">Company Number *</Label>
                  <Input
                    id="company-number"
                    placeholder="e.g., 12345678"
                    value={companyNumber}
                    onChange={(e) => setCompanyNumber(e.target.value)}
                    disabled={selectedFromSearch}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="utr">UTR (Unique Taxpayer Reference) *</Label>
                  <Input
                    id="utr"
                    placeholder="e.g., 1234567890"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paye">PAYE Reference (Optional)</Label>
                  <Input
                    id="paye"
                    placeholder="e.g., 123/AB456"
                    value={payeReference}
                    onChange={(e) => setPayeReference(e.target.value)}
                  />
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground mb-3">Key Contact</p>
                  
                  <div className="space-y-2 mb-3">
                    <Label htmlFor="contact-name">Contact Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contact-name"
                        placeholder="e.g., John Smith"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <Label htmlFor="contact-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="e.g., john@company.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contact-phone"
                        type="tel"
                        placeholder="e.g., 07700 900123"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  resetNewClientForm()
                  setNewClientOpen(false)
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateClient}
                  disabled={!companyName || !companyNumber || !utr || !contactName || !contactEmail || !contactPhone}
                >
                  Create Client
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Primary: Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
        <Input
          placeholder="Search by company name or number..."
          className="pl-12 h-12 text-base shadow-[var(--shadow-elevation-medium)] focus-visible:shadow-[var(--shadow-elevation-high)]"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            if (e.target.value) setSelectedLetter(null)
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Secondary: A-Z Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => {
              setSelectedLetter(null)
              setSearchQuery("")
            }}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded transition-colors",
              !selectedLetter && !searchQuery
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            All
          </button>
          {alphabet.map((letter) => {
            const hasClients = (grouped[letter]?.length || 0) > 0
            return (
              <button
                key={letter}
                onClick={() => {
                  if (hasClients) {
                    setSelectedLetter(letter)
                    setSearchQuery("")
                  }
                }}
                disabled={!hasClients}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded transition-colors",
                  selectedLetter === letter
                    ? "bg-primary text-primary-foreground"
                    : hasClients
                    ? "text-muted-foreground hover:bg-muted"
                    : "text-muted-foreground/30 cursor-not-allowed"
                )}
              >
                {letter}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {searchQuery
            ? `${filteredClients.length} result${filteredClients.length !== 1 ? "s" : ""} for "${searchQuery}"`
            : selectedLetter
            ? `${filteredClients.length} client${filteredClients.length !== 1 ? "s" : ""} starting with "${selectedLetter}"`
            : `${clientList.length} clients`}
        </p>
      </div>

      {/* Client List */}
      <div className="rounded-lg border border-border overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium text-foreground">No clients found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Add a client to get started"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleClientClick(client)}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground flex-shrink-0">
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate leading-tight">{client.name}</p>
                  <p className="text-sm text-muted-foreground leading-tight">{client.number}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
