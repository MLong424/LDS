// src/pages/admin/Settings/SystemSettings.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Shield, Database, Mail } from 'lucide-react';

const SystemSettings: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">System Settings</h1>
                <p className="text-muted-foreground">
                    Configure system-wide settings and preferences
                </p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            General Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="site-name">Site Name</Label>
                            <Input id="site-name" defaultValue="Mediastore" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="site-description">Site Description</Label>
                            <Input 
                                id="site-description" 
                                defaultValue="Your one-stop shop for books, music, and movies" 
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Maintenance Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                    Temporarily disable the site for maintenance
                                </p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Two-Factor Authentication</Label>
                                <p className="text-sm text-muted-foreground">
                                    Require 2FA for admin accounts
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Session Timeout</Label>
                                <p className="text-sm text-muted-foreground">
                                    Auto-logout inactive sessions
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="timeout-duration">Timeout Duration (minutes)</Label>
                            <Input id="timeout-duration" type="number" defaultValue="30" className="w-32" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Email Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="smtp-host">SMTP Host</Label>
                            <Input id="smtp-host" placeholder="smtp.example.com" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="smtp-port">SMTP Port</Label>
                                <Input id="smtp-port" type="number" defaultValue="587" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="smtp-username">Username</Label>
                                <Input id="smtp-username" placeholder="user@example.com" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Enable Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Send system notifications via email
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Database & Backup
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Automatic Backups</Label>
                                <p className="text-sm text-muted-foreground">
                                    Schedule regular database backups
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="backup-frequency">Backup Frequency</Label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="daily">Daily</option>
                                <option value="weekly" selected>Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline">Test Database Connection</Button>
                            <Button variant="outline">Create Backup Now</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button>Save Settings</Button>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;