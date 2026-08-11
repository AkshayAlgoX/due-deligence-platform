package com.realestate.duediligence.service;

public interface AdminExportService {

    byte[] exportDashboard(String format, int periodDays, String language);

}