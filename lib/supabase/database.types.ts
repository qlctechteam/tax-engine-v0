/**
 * Database Types for Supabase
 * 
 * These types are generated based on the TaxEngine Prisma schema.
 * In production, you should generate these automatically using:
 * 
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts
 * 
 * Or if using local Supabase:
 *   npx supabase gen types typescript --local > lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums matching the Prisma schema
export type UserRole = 'ADMINISTRATOR' | 'CLAIM_PROCESSOR'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_INVITATION'
export type AuditCategory = 'AUTH' | 'CLAIM' | 'CLIENT' | 'SUBMISSION' | 'SETTINGS' | 'USER' | 'DOCUMENT'
export type TemplateCategory = 'EXPORT' | 'REPORT' | 'LETTER'
export type ClaimStage = 'UPLOAD' | 'SCAN_EXTRACT' | 'BUILD_CT600' | 'REVIEW' | 'SUBMIT'
export type ClaimStatus = 'IN_PROGRESS' | 'READY' | 'AWAITING' | 'COMPLETED' | 'ON_HOLD'
export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'PENDING_RESPONSE'
export type GatewayStatus = 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED'
export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
export type InvoiceType = 'STANDARD' | 'PROFORMA' | 'CREDIT_NOTE'

export interface Database {
  public: {
    Tables: {
      taxengine_users: {
        Row: {
          id: number
          uuid: string
          firstName: string | null
          lastName: string | null
          email: string
          username: string | null
          avatarUrl: string | null
          role: UserRole
          status: UserStatus
          hash: string | null
          salt: string | null
          resetPasswordToken: string | null
          resetPasswordExpires: string | null
          ssoProvider: string | null
          ssoProviderId: string | null
          lastLoginAt: string | null
          invitationSentAt: string | null
          invitationAcceptedAt: string | null
          invitedById: number | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          uuid?: string
          firstName?: string | null
          lastName?: string | null
          email: string
          username?: string | null
          avatarUrl?: string | null
          role?: UserRole
          status?: UserStatus
          hash?: string | null
          salt?: string | null
          resetPasswordToken?: string | null
          resetPasswordExpires?: string | null
          ssoProvider?: string | null
          ssoProviderId?: string | null
          lastLoginAt?: string | null
          invitationSentAt?: string | null
          invitationAcceptedAt?: string | null
          invitedById?: number | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          uuid?: string
          firstName?: string | null
          lastName?: string | null
          email?: string
          username?: string | null
          avatarUrl?: string | null
          role?: UserRole
          status?: UserStatus
          hash?: string | null
          salt?: string | null
          resetPasswordToken?: string | null
          resetPasswordExpires?: string | null
          ssoProvider?: string | null
          ssoProviderId?: string | null
          lastLoginAt?: string | null
          invitationSentAt?: string | null
          invitationAcceptedAt?: string | null
          invitedById?: number | null
          createdAt?: string
          updatedAt?: string
        }
      }
      client_companies: {
        Row: {
          id: number
          uuid: string
          ucc: string | null
          companyName: string
          companyNumber: string | null
          utr: string | null
          vatNumber: string | null
          payeReference: string | null
          registeredAddress: Json | null
          tradingAddress: Json | null
          phone: string | null
          email: string | null
          website: string | null
          industry: string | null
          sicCodes: string[]
          bio: string | null
          companyYearEndDay: number | null
          companyYearEndMonth: number | null
          isActive: boolean
          lifecycleStage: string | null
          bankName: string | null
          bankAccountName: string | null
          bankAccountNumber: string | null
          bankSortCode: string | null
          referralCompany: string | null
          referralFee: number | null
          referralType: string | null
          directorsList: Json | null
          companiesHouseData: Json | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          uuid?: string
          ucc?: string | null
          companyName: string
          companyNumber?: string | null
          utr?: string | null
          vatNumber?: string | null
          payeReference?: string | null
          registeredAddress?: Json | null
          tradingAddress?: Json | null
          phone?: string | null
          email?: string | null
          website?: string | null
          industry?: string | null
          sicCodes?: string[]
          bio?: string | null
          companyYearEndDay?: number | null
          companyYearEndMonth?: number | null
          isActive?: boolean
          lifecycleStage?: string | null
          bankName?: string | null
          bankAccountName?: string | null
          bankAccountNumber?: string | null
          bankSortCode?: string | null
          referralCompany?: string | null
          referralFee?: number | null
          referralType?: string | null
          directorsList?: Json | null
          companiesHouseData?: Json | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          uuid?: string
          ucc?: string | null
          companyName?: string
          companyNumber?: string | null
          utr?: string | null
          vatNumber?: string | null
          payeReference?: string | null
          registeredAddress?: Json | null
          tradingAddress?: Json | null
          phone?: string | null
          email?: string | null
          website?: string | null
          industry?: string | null
          sicCodes?: string[]
          bio?: string | null
          companyYearEndDay?: number | null
          companyYearEndMonth?: number | null
          isActive?: boolean
          lifecycleStage?: string | null
          bankName?: string | null
          bankAccountName?: string | null
          bankAccountNumber?: string | null
          bankSortCode?: string | null
          referralCompany?: string | null
          referralFee?: number | null
          referralType?: string | null
          directorsList?: Json | null
          companiesHouseData?: Json | null
          createdAt?: string
          updatedAt?: string
        }
      }
      accounting_period: {
        Row: {
          id: number
          uuid: string
          clientCompanyId: number | null
          clientCompanyUuid: string | null
          status: string | null
          startDate: string | null
          endDate: string | null
          value: number | null
          method: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          uuid?: string
          clientCompanyId?: number | null
          clientCompanyUuid?: string | null
          status?: string | null
          startDate?: string | null
          endDate?: string | null
          value?: number | null
          method?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          uuid?: string
          clientCompanyId?: number | null
          clientCompanyUuid?: string | null
          status?: string | null
          startDate?: string | null
          endDate?: string | null
          value?: number | null
          method?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      claim_packs: {
        Row: {
          id: number
          uuid: string
          title: string
          periodLabel: string | null
          status: ClaimStatus
          currentStage: ClaimStage
          nextAction: string | null
          progress: number
          clientCompanyId: number
          accountingPeriodId: number | null
          ct600GroupId: number | null
          assignedToId: number | null
          createdById: number | null
          uploadCompletedAt: string | null
          scanExtractCompletedAt: string | null
          buildCt600CompletedAt: string | null
          reviewCompletedAt: string | null
          submittedAt: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          uuid?: string
          title: string
          periodLabel?: string | null
          status?: ClaimStatus
          currentStage?: ClaimStage
          nextAction?: string | null
          progress?: number
          clientCompanyId: number
          accountingPeriodId?: number | null
          ct600GroupId?: number | null
          assignedToId?: number | null
          createdById?: number | null
          uploadCompletedAt?: string | null
          scanExtractCompletedAt?: string | null
          buildCt600CompletedAt?: string | null
          reviewCompletedAt?: string | null
          submittedAt?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          uuid?: string
          title?: string
          periodLabel?: string | null
          status?: ClaimStatus
          currentStage?: ClaimStage
          nextAction?: string | null
          progress?: number
          clientCompanyId?: number
          accountingPeriodId?: number | null
          ct600GroupId?: number | null
          assignedToId?: number | null
          createdById?: number | null
          uploadCompletedAt?: string | null
          scanExtractCompletedAt?: string | null
          buildCt600CompletedAt?: string | null
          reviewCompletedAt?: string | null
          submittedAt?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      submissions: {
        Row: {
          id: number
          uuid: string
          title: string
          packRef: string | null
          status: SubmissionStatus
          clientCompanyId: number
          claimPackId: number | null
          ct600GroupId: number | null
          correlationId: string | null
          submittedAt: string | null
          submittedById: number | null
          hmrcResponse: Json | null
          receiptPdfKey: string | null
          receiptXml: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          uuid?: string
          title: string
          packRef?: string | null
          status?: SubmissionStatus
          clientCompanyId: number
          claimPackId?: number | null
          ct600GroupId?: number | null
          correlationId?: string | null
          submittedAt?: string | null
          submittedById?: number | null
          hmrcResponse?: Json | null
          receiptPdfKey?: string | null
          receiptXml?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          uuid?: string
          title?: string
          packRef?: string | null
          status?: SubmissionStatus
          clientCompanyId?: number
          claimPackId?: number | null
          ct600GroupId?: number | null
          correlationId?: string | null
          submittedAt?: string | null
          submittedById?: number | null
          hmrcResponse?: Json | null
          receiptPdfKey?: string | null
          receiptXml?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      audit_log: {
        Row: {
          id: number
          uuid: string
          action: string
          details: string | null
          category: AuditCategory
          userId: number | null
          clientCompanyId: number | null
          claimPackId: number | null
          ipAddress: string | null
          userAgent: string | null
          timestamp: string
        }
        Insert: {
          id?: number
          uuid?: string
          action: string
          details?: string | null
          category: AuditCategory
          userId?: number | null
          clientCompanyId?: number | null
          claimPackId?: number | null
          ipAddress?: string | null
          userAgent?: string | null
          timestamp?: string
        }
        Update: {
          id?: number
          uuid?: string
          action?: string
          details?: string | null
          category?: AuditCategory
          userId?: number | null
          clientCompanyId?: number | null
          claimPackId?: number | null
          ipAddress?: string | null
          userAgent?: string | null
          timestamp?: string
        }
      }
      templates: {
        Row: {
          id: number
          uuid: string
          name: string
          description: string | null
          category: TemplateCategory
          version: string
          templateType: string | null
          templateKey: string | null
          templateData: Json | null
          isActive: boolean
          isDefault: boolean
          lastModifiedById: number | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          uuid?: string
          name: string
          description?: string | null
          category: TemplateCategory
          version: string
          templateType?: string | null
          templateKey?: string | null
          templateData?: Json | null
          isActive?: boolean
          isDefault?: boolean
          lastModifiedById?: number | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          uuid?: string
          name?: string
          description?: string | null
          category?: TemplateCategory
          version?: string
          templateType?: string | null
          templateKey?: string | null
          templateData?: Json | null
          isActive?: boolean
          isDefault?: boolean
          lastModifiedById?: number | null
          createdAt?: string
          updatedAt?: string
        }
      }
      government_gateway: {
        Row: {
          id: number
          uuid: string
          name: string | null
          isDefault: boolean
          agentUserId: string
          encryptedPassword: string | null
          status: GatewayStatus
          lastVerifiedAt: string | null
          connectedAt: string | null
          disconnectedAt: string | null
          ct600Authorised: boolean
          rndAuthorised: boolean
          ixbrlAuthorised: boolean
          lastModifiedById: number | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          uuid?: string
          name?: string | null
          isDefault?: boolean
          agentUserId: string
          encryptedPassword?: string | null
          status?: GatewayStatus
          lastVerifiedAt?: string | null
          connectedAt?: string | null
          disconnectedAt?: string | null
          ct600Authorised?: boolean
          rndAuthorised?: boolean
          ixbrlAuthorised?: boolean
          lastModifiedById?: number | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          uuid?: string
          name?: string | null
          isDefault?: boolean
          agentUserId?: string
          encryptedPassword?: string | null
          status?: GatewayStatus
          lastVerifiedAt?: string | null
          connectedAt?: string | null
          disconnectedAt?: string | null
          ct600Authorised?: boolean
          rndAuthorised?: boolean
          ixbrlAuthorised?: boolean
          lastModifiedById?: number | null
          createdAt?: string
          updatedAt?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      UserRole: UserRole
      UserStatus: UserStatus
      AuditCategory: AuditCategory
      TemplateCategory: TemplateCategory
      ClaimStage: ClaimStage
      ClaimStatus: ClaimStatus
      SubmissionStatus: SubmissionStatus
      GatewayStatus: GatewayStatus
      InvoiceStatus: InvoiceStatus
      InvoiceType: InvoiceType
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type TaxEngineUser = Tables<'taxengine_users'>
export type ClientCompany = Tables<'client_companies'>
export type AccountingPeriod = Tables<'accounting_period'>
export type ClaimPack = Tables<'claim_packs'>
export type Submission = Tables<'submissions'>
export type AuditLog = Tables<'audit_log'>
export type Template = Tables<'templates'>
export type GovernmentGateway = Tables<'government_gateway'>
