import Template from '../models/Template';
import { ITemplate } from '../models/Template';
import { IUser } from '../models/User';
import logger from '../utils/logger';

interface TemplateCreateParams {
  user: IUser;
  name: string;
  description?: string;
  subject: string;
  text?: string;
  html: string;
  variables?: string[];
  isPublic?: boolean;
}

interface TemplateUpdateParams {
  name?: string;
  description?: string;
  subject?: string;
  text?: string;
  html?: string;
  variables?: string[];
  isPublic?: boolean;
}

interface RenderTemplateParams {
  templateId: string;
  data: Record<string, any>;
}

class TemplateService {
  // Create a new template
  public async createTemplate(params: TemplateCreateParams): Promise<ITemplate> {
    try {
      // Extract variables from template content
      const extractedVariables = this.extractVariables(params.html);
      const variables = params.variables || extractedVariables;
      
      const template = new Template({
        user: params.user._id,
        name: params.name,
        description: params.description,
        subject: params.subject,
        text: params.text,
        html: params.html,
        variables,
        isPublic: params.isPublic || false,
      });

      await template.save();
      logger.info(`Template created: ${template.name}`);
      return template;
    } catch (error) {
      logger.error(`Error creating template: ${error}`);
      throw error;
    }
  }

  // Update an existing template
  public async updateTemplate(
    templateId: string,
    userId: string,
    updates: TemplateUpdateParams
  ): Promise<ITemplate | null> {
    try {
      // Extract variables if HTML is being updated
      let variables = updates.variables;
      if (updates.html) {
        const extractedVariables = this.extractVariables(updates.html);
        variables = variables || extractedVariables;
      }

      const updatedTemplate = await Template.findOneAndUpdate(
        { _id: templateId, user: userId },
        { ...updates, ...(variables && { variables }) },
        { new: true }
      );

      if (!updatedTemplate) {
        logger.warn(`Template not found or user doesn't have access: ${templateId}`);
        return null;
      }

      logger.info(`Template updated: ${updatedTemplate.name}`);
      return updatedTemplate;
    } catch (error) {
      logger.error(`Error updating template: ${error}`);
      throw error;
    }
  }

  // Delete a template
  public async deleteTemplate(templateId: string, userId: string): Promise<boolean> {
    try {
      const result = await Template.deleteOne({ _id: templateId, user: userId });
      
      if (result.deletedCount === 0) {
        logger.warn(`Template not found or user doesn't have access: ${templateId}`);
        return false;
      }

      logger.info(`Template deleted: ${templateId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting template: ${error}`);
      throw error;
    }
  }

  // Get template by ID
  public async getTemplateById(templateId: string, userId?: string): Promise<ITemplate | null> {
    try {
      // Either get user's own template or a public template
      const query = userId 
        ? { _id: templateId, $or: [{ user: userId }, { isPublic: true }] }
        : { _id: templateId, isPublic: true };
        
      const template = await Template.findOne(query);
      
      if (!template) {
        logger.warn(`Template not found or access denied: ${templateId}`);
        return null;
      }
      
      return template;
    } catch (error) {
      logger.error(`Error getting template: ${error}`);
      throw error;
    }
  }

  // List templates for a user
  public async listTemplates(userId: string, limit = 10, skip = 0): Promise<ITemplate[]> {
    try {
      return Template.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } catch (error) {
      logger.error(`Error listing templates: ${error}`);
      throw error;
    }
  }

  // List public templates
  public async listPublicTemplates(limit = 10, skip = 0): Promise<ITemplate[]> {
    try {
      return Template.find({ isPublic: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } catch (error) {
      logger.error(`Error listing public templates: ${error}`);
      throw error;
    }
  }

  // Render a template with data
  public async renderTemplate(params: RenderTemplateParams): Promise<{ subject: string; html: string; text?: string }> {
    try {
      const template = await Template.findById(params.templateId);
      
      if (!template) {
        throw new Error(`Template not found: ${params.templateId}`);
      }
      
      // Render the template
      const subject = this.replaceVariables(template.subject, params.data);
      const html = this.replaceVariables(template.html, params.data);
      let text: string | undefined;
      
      if (template.text) {
        text = this.replaceVariables(template.text, params.data);
      }
      
      return { subject, html, text };
    } catch (error) {
      logger.error(`Error rendering template: ${error}`);
      throw error;
    }
  }

  // Extract variables from the template content (looks for patterns like {{variable}})
  private extractVariables(content: string): string[] {
    const regex = /{{([^{}]+)}}/g;
    const variables = new Set<string>();
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      variables.add(match[1].trim());
    }
    
    return Array.from(variables);
  }

  // Replace variables in the content with actual data
  private replaceVariables(content: string, data: Record<string, any>): string {
    return content.replace(/{{([^{}]+)}}/g, (match, variable) => {
      const key = variable.trim();
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }
}

export default new TemplateService(); 