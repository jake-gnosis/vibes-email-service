import { Request, Response } from 'express';
import templateService from '../services/TemplateService';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

export const createTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      subject,
      text,
      html,
      variables,
      isPublic,
    } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Template name is required',
      });
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required',
      });
    }

    if (!html) {
      return res.status(400).json({
        success: false,
        message: 'HTML content is required',
      });
    }

    // Create the template
    const template = await templateService.createTemplate({
      user: req.user,
      name,
      description,
      subject,
      text,
      html,
      variables,
      isPublic,
    });

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: {
        id: template._id,
        name: template.name,
        variables: template.variables,
      },
    });
  } catch (error) {
    logger.error(`Error in createTemplate controller: ${error}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create template',
    });
  }
};

export const updateTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      subject,
      text,
      html,
      variables,
      isPublic,
    } = req.body;

    // Update the template
    const template = await templateService.updateTemplate(
      id,
      req.user._id,
      {
        name,
        description,
        subject,
        text,
        html,
        variables,
        isPublic,
      }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      data: {
        id: template._id,
        name: template.name,
        variables: template.variables,
      },
    });
  } catch (error) {
    logger.error(`Error in updateTemplate controller: ${error}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update template',
    });
  }
};

export const deleteTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Delete the template
    const deleted = await templateService.deleteTemplate(id, req.user._id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    logger.error(`Error in deleteTemplate controller: ${error}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete template',
    });
  }
};

export const getTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get the template
    const template = await templateService.getTemplateById(id, req.user._id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: template._id,
        name: template.name,
        description: template.description,
        subject: template.subject,
        variables: template.variables,
        isPublic: template.isPublic,
        createdAt: template.createdAt,
      },
    });
  } catch (error) {
    logger.error(`Error in getTemplate controller: ${error}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get template',
    });
  }
};

export const listTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = parseInt(req.query.skip as string, 10) || 0;

    // List templates
    const templates = await templateService.listTemplates(req.user._id, limit, skip);

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates.map(template => ({
        id: template._id,
        name: template.name,
        description: template.description,
        subject: template.subject,
        variables: template.variables,
        isPublic: template.isPublic,
        createdAt: template.createdAt,
      })),
    });
  } catch (error) {
    logger.error(`Error in listTemplates controller: ${error}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to list templates',
    });
  }
};

export const listPublicTemplates = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = parseInt(req.query.skip as string, 10) || 0;

    // List public templates
    const templates = await templateService.listPublicTemplates(limit, skip);

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates.map(template => ({
        id: template._id,
        name: template.name,
        description: template.description,
        subject: template.subject,
        variables: template.variables,
        createdAt: template.createdAt,
      })),
    });
  } catch (error) {
    logger.error(`Error in listPublicTemplates controller: ${error}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to list public templates',
    });
  }
}; 